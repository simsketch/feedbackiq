# FeedbackIQ

## Deployment

- Pushing to `main` auto-deploys to Vercel. Production domain: **feedbackiq.app**.
- **CRITICAL: commit ≠ deploy.** A commit that sits locally is not on feedbackiq.app. After any `git commit` on `main`, immediately `git push origin main` — never tell the user a change is "live" or "shipped" without confirming the push succeeded.
- When you finish a task that involves code changes, the definition of done is: committed AND pushed. Not just committed.
- If the user reports "I don't see the change on the site," first thing to check: `git log origin/main..HEAD` — unpushed commits are the most common cause.
