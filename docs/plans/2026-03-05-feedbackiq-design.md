# FeedbackIQ Design Document

**Date:** 2026-03-05
**Domain:** feedbackiq.app

## Overview

FeedbackIQ is a SaaS platform that turns user feedback into pull requests. Companies embed a lightweight widget on their site, end users submit feedback, and an AI agent analyzes the codebase and generates a PR addressing the feedback.

Three core parts:
1. **Embeddable widget** -- lightweight JS snippet that collects feedback
2. **Dashboard + API** -- company signup, GitHub integration, feedback management
3. **AI agent** -- uses Claude Agent SDK to read the repo and generate PRs

## Architecture

```
+--------------------------------------------------+
|                  Vercel (Next.js)                 |
|                                                   |
|  +----------+  +----------+  +----------------+  |
|  |Dashboard |  | API      |  | Agent Worker   |  |
|  |(React)   |  | Routes   |  | (Background    |  |
|  |          |  |          |  |  Functions)    |  |
|  +----------+  +----------+  +----------------+  |
|                      |               |            |
|                      v               v            |
|               +----------+   +--------------+     |
|               | Postgres |   | Claude Agent |     |
|               | (Neon)   |   | SDK + GitHub |     |
|               +----------+   +--------------+     |
+--------------------------------------------------+

+----------------+
| Customer's     |       +--------------+
| Website        |------>| Widget (JS)  |---> POST /api/v1/feedback
|                |       | (CDN-hosted) |     (with site key)
+----------------+       +--------------+
```

Single Next.js monorepo deployed on Vercel. If agent work exceeds Vercel's background function time limits (5 min on Pro), extract the agent worker to a separate service.

## Tech Stack

| Component | Technology |
|---|---|
| Framework | Next.js (TypeScript) |
| Hosting | Vercel |
| Database | PostgreSQL via Neon |
| Auth | NextAuth.js (email/password) |
| GitHub | GitHub App (installation-based) |
| AI | Claude Agent SDK |
| Widget | Vanilla JS/TS, Shadow DOM |

## Data Model

### companies
- id (uuid, pk)
- name
- github_installation_id
- created_at
- updated_at

### users
- id (uuid, pk)
- company_id (fk -> companies)
- email
- name
- role (owner | admin | member)
- created_at
- updated_at

### projects
- id (uuid, pk)
- company_id (fk -> companies)
- name
- github_repo (owner/repo format)
- default_branch
- auto_generate_prs (boolean, default false)
- site_key (public key for widget)
- created_at
- updated_at

### feedback
- id (uuid, pk)
- project_id (fk -> projects)
- content (text)
- submitter_email (optional)
- source_url (page where widget was triggered)
- status (new | reviewing | generating | pr_created | closed)
- created_at
- updated_at

### pull_requests
- id (uuid, pk)
- feedback_id (fk -> feedback)
- github_pr_url
- github_pr_number
- branch_name
- status (pending | open | merged | closed)
- agent_log (text)
- created_at
- updated_at

## Widget

Embed snippet (generated per project):
```html
<script src="https://cdn.feedbackiq.app/widget.js"
        data-site-key="pk_live_abc123"></script>
```

- Standalone vanilla JS/TS bundle, <10KB gzipped
- Shadow DOM to isolate styles from host page
- Floating button in bottom-right corner, expands to feedback form on click
- Form: text area (with prompt for detailed feedback), optional email, submit button
- POSTs to `https://api.feedbackiq.app/v1/feedback` with site_key, content, email, source_url
- No cookies, no tracking
- CORS open, validated server-side via site key

## Auth and GitHub Integration

### User Auth
- NextAuth.js with email/password
- Company created on first signup, user becomes owner
- Team members invited by email

### GitHub App
- Companies install the FeedbackIQ GitHub App from the dashboard
- Redirected to GitHub to select repos to grant access
- Permissions: repo read/write, PR creation, branch creation
- Installation ID stored on companies table
- GitHub App (not OAuth App) for: no token expiry issues, fine-grained permissions, higher rate limits

### Onboarding Flow
1. User signs up -> company created
2. Dashboard prompts "Connect GitHub" -> install GitHub App
3. Create project -> select from available repos
4. Dashboard generates widget snippet with site key
5. User drops snippet on their site

## Agent Worker (PR Generation)

### Trigger
- If `auto_generate_prs` is true: feedback arrives -> immediately queue agent, status -> `generating`
- If false: feedback sits at `new` until "Generate PR" clicked in dashboard

### Execution (Vercel background function)
1. Fetch feedback item + project/repo details
2. Get GitHub installation token
3. Claude Agent SDK with tools: read file, search code, list directory, create/edit file (all via GitHub API)
4. System prompt includes repo context, feedback content, source URL
5. Agent explores repo, identifies relevant files, generates changes
6. Create branch (`feedbackiq/feedback-{id}`), commit via GitHub API, open PR
7. PR description includes: original feedback, changes summary, link to dashboard
8. Update feedback status -> `pr_created`, save PR record

### Safety Rails
- Max file changes per PR (10 files)
- Max token budget per agent run
- Timeout limit on background function
- Configurable target branch (defaults to default_branch)

## API Routes

### Auth
- POST /api/auth/signup
- POST /api/auth/[...nextauth]

### GitHub
- GET /api/github/install
- GET /api/github/callback
- GET /api/github/repos

### Projects
- GET /api/projects
- POST /api/projects
- GET /api/projects/:id
- PATCH /api/projects/:id

### Feedback (public, site key validated)
- POST /api/v1/feedback

### Feedback (dashboard, authenticated)
- GET /api/feedback
- GET /api/feedback/:id
- POST /api/feedback/:id/generate

### Pull Requests
- GET /api/pull-requests
- GET /api/pull-requests/:id

### Webhooks
- POST /api/webhooks/github

## Dashboard Pages

```
/                                          -- Landing page
/login                                     -- Sign in
/signup                                    -- Create account + company
/dashboard                                 -- Overview: recent feedback, PR stats
/dashboard/projects                        -- List projects
/dashboard/projects/new                    -- Create project (select repo, get snippet)
/dashboard/projects/:id                    -- Project detail + settings
/dashboard/projects/:id/feedback           -- Feedback list
/dashboard/projects/:id/feedback/:id       -- Feedback detail + trigger PR
/dashboard/projects/:id/prs               -- PR list
/dashboard/settings                        -- Company settings, team members
/dashboard/settings/github                 -- GitHub connection management
```

## PR Workflow

Configurable per project:
- **Approval gate (default):** Feedback arrives at `new`, company reviews in dashboard, clicks "Generate PR"
- **Auto-generate:** Feedback triggers agent immediately, company reviews the resulting PR on GitHub
