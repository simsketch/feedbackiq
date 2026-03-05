# FeedbackIQ Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a SaaS platform that turns website user feedback into GitHub pull requests using Claude Agent SDK.

**Architecture:** Next.js monorepo on Vercel with Postgres (Neon), NextAuth for auth, GitHub App for repo access, Claude Agent SDK for PR generation, and a standalone vanilla JS widget for feedback collection.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Prisma ORM, Neon Postgres, NextAuth.js v5, Tailwind CSS, Claude Agent SDK, Octokit (GitHub API)

**Design Doc:** `docs/plans/2026-03-05-feedbackiq-design.md`

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `.env.example`, `.gitignore`

**Step 1: Initialize Next.js project**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: Project scaffolded with App Router, TypeScript, Tailwind, ESLint.

**Step 2: Verify dev server starts**

Run: `npm run dev`
Expected: App running on localhost:3000 with default Next.js page.

**Step 3: Create .env.example**

Create `.env.example`:
```env
# Database
DATABASE_URL=postgresql://user:password@host/feedbackiq

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secret

# GitHub App
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_APP_WEBHOOK_SECRET=

# Anthropic
ANTHROPIC_API_KEY=
```

**Step 4: Update .gitignore**

Add to `.gitignore`:
```
.env
.env.local
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with TypeScript and Tailwind"
```

---

## Task 2: Database Schema with Prisma

**Files:**
- Create: `prisma/schema.prisma`
- Modify: `package.json` (add prisma deps)

**Step 1: Install Prisma**

Run:
```bash
npm install prisma --save-dev && npm install @prisma/client
```

**Step 2: Initialize Prisma**

Run:
```bash
npx prisma init
```

Expected: Creates `prisma/schema.prisma` and updates `.env` with DATABASE_URL placeholder.

**Step 3: Write the schema**

Replace `prisma/schema.prisma` with:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  owner
  admin
  member
}

enum FeedbackStatus {
  new
  reviewing
  generating
  pr_created
  closed
}

enum PullRequestStatus {
  pending
  open
  merged
  closed
}

model Company {
  id                    String    @id @default(uuid())
  name                  String
  githubInstallationId  Int?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  users    User[]
  projects Project[]
}

model User {
  id        String   @id @default(uuid())
  companyId String
  email     String   @unique
  name      String?
  password  String
  role      UserRole @default(member)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])
}

model Project {
  id               String   @id @default(uuid())
  companyId        String
  name             String
  githubRepo       String
  defaultBranch    String   @default("main")
  autoGeneratePrs  Boolean  @default(false)
  siteKey          String   @unique @default(uuid())
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  company  Company    @relation(fields: [companyId], references: [id])
  feedback Feedback[]
}

model Feedback {
  id             String         @id @default(uuid())
  projectId      String
  content        String
  submitterEmail String?
  sourceUrl      String?
  status         FeedbackStatus @default(new)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  project      Project       @relation(fields: [projectId], references: [id])
  pullRequests PullRequest[]
}

model PullRequest {
  id              String            @id @default(uuid())
  feedbackId      String
  githubPrUrl     String?
  githubPrNumber  Int?
  branchName      String
  status          PullRequestStatus @default(pending)
  agentLog        String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  feedback Feedback @relation(fields: [feedbackId], references: [id])
}
```

**Step 4: Create Prisma client singleton**

Create `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Step 5: Generate Prisma client**

Run:
```bash
npx prisma generate
```

Expected: Prisma client generated successfully.

**Step 6: Commit**

```bash
git add prisma/ src/lib/prisma.ts package.json package-lock.json
git commit -m "feat: add Prisma schema with all data models"
```

---

## Task 3: Authentication with NextAuth v5

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/api/auth/signup/route.ts`
- Create: `src/middleware.ts`

**Step 1: Install dependencies**

Run:
```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs && npm install --save-dev @types/bcryptjs
```

**Step 2: Create auth configuration**

Create `src/lib/auth.ts`:
```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          companyId: user.companyId,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.companyId = (user as any).companyId;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as any).companyId = token.companyId;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
```

**Step 3: Create auth route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

**Step 4: Create signup endpoint**

Create `src/app/api/auth/signup/route.ts`:
```typescript
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { email, password, name, companyName } = await request.json();

  if (!email || !password || !companyName) {
    return NextResponse.json(
      { error: "Email, password, and company name are required" },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const company = await prisma.company.create({
    data: {
      name: companyName,
      users: {
        create: {
          email,
          name,
          password: hashedPassword,
          role: "owner",
        },
      },
    },
    include: { users: true },
  });

  return NextResponse.json(
    { id: company.users[0].id, email: company.users[0].email },
    { status: 201 }
  );
}
```

**Step 5: Create middleware for protected routes**

Create `src/middleware.ts`:
```typescript
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/api/projects/:path*", "/api/feedback/:path*", "/api/pull-requests/:path*", "/api/github/:path*"],
};
```

**Step 6: Create auth type declarations**

Create `src/types/next-auth.d.ts`:
```typescript
import "next-auth";

declare module "next-auth" {
  interface User {
    companyId: string;
    role: string;
  }

  interface Session {
    user: User & {
      id: string;
      companyId: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    companyId: string;
    role: string;
  }
}
```

**Step 7: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/ src/middleware.ts src/types/ package.json package-lock.json
git commit -m "feat: add NextAuth v5 with credentials provider and signup"
```

---

## Task 4: Signup and Login Pages

**Files:**
- Create: `src/app/signup/page.tsx`
- Create: `src/app/login/page.tsx`

**Step 1: Create signup page**

Create `src/app/signup/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      companyName: formData.get("companyName") as string,
    };

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Signup failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created but login failed. Please try logging in.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Create your account</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
              Company name
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-black font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Create login page**

Create `src/app/login/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Log in</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-black font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**Step 3: Verify both pages render**

Run: `npm run dev`
Visit `http://localhost:3000/signup` and `http://localhost:3000/login`.
Expected: Both forms render with inputs and buttons.

**Step 4: Commit**

```bash
git add src/app/signup/ src/app/login/
git commit -m "feat: add signup and login pages"
```

---

## Task 5: Dashboard Layout and Overview Page

**Files:**
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/dashboard-nav.tsx`

**Step 1: Create dashboard nav component**

Create `src/components/dashboard-nav.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-bold text-lg">
            FeedbackIQ
          </Link>
          <div className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm ${
                  pathname === item.href
                    ? "text-black font-medium"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-gray-500 hover:text-black"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
```

**Step 2: Create dashboard layout**

Create `src/app/dashboard/layout.tsx`:
```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
```

**Step 3: Create dashboard overview page**

Create `src/app/dashboard/page.tsx`:
```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const companyId = session!.user.companyId;

  const [feedbackCount, prCount, projectCount] = await Promise.all([
    prisma.feedback.count({
      where: { project: { companyId } },
    }),
    prisma.pullRequest.count({
      where: { feedback: { project: { companyId } } },
    }),
    prisma.project.count({ where: { companyId } }),
  ]);

  const recentFeedback = await prisma.feedback.findMany({
    where: { project: { companyId } },
    include: { project: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Projects</p>
          <p className="text-3xl font-bold">{projectCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Feedback</p>
          <p className="text-3xl font-bold">{feedbackCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">PRs Generated</p>
          <p className="text-3xl font-bold">{prCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Recent Feedback</h2>
          {projectCount === 0 && (
            <Link
              href="/dashboard/projects/new"
              className="text-sm bg-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800"
            >
              Create your first project
            </Link>
          )}
        </div>
        {recentFeedback.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No feedback yet.</p>
        ) : (
          <ul className="divide-y">
            {recentFeedback.map((fb) => (
              <li key={fb.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{fb.content.slice(0, 100)}{fb.content.length > 100 ? "..." : ""}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {fb.project.name} &middot; {fb.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    fb.status === "new" ? "bg-blue-100 text-blue-700" :
                    fb.status === "pr_created" ? "bg-green-100 text-green-700" :
                    fb.status === "generating" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {fb.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/dashboard/ src/components/
git commit -m "feat: add dashboard layout, nav, and overview page"
```

---

## Task 6: Projects API and Pages

**Files:**
- Create: `src/app/api/projects/route.ts`
- Create: `src/app/api/projects/[id]/route.ts`
- Create: `src/app/dashboard/projects/page.tsx`
- Create: `src/app/dashboard/projects/new/page.tsx`
- Create: `src/app/dashboard/projects/[id]/page.tsx`

**Step 1: Create projects list/create API**

Create `src/app/api/projects/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { feedback: true } },
    },
  });

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, githubRepo, defaultBranch } = await request.json();

  if (!name || !githubRepo) {
    return NextResponse.json(
      { error: "Name and GitHub repo are required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.create({
    data: {
      companyId: session.user.companyId,
      name,
      githubRepo,
      defaultBranch: defaultBranch || "main",
    },
  });

  return NextResponse.json(project, { status: 201 });
}
```

**Step 2: Create project detail/update API**

Create `src/app/api/projects/[id]/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, companyId: session.user.companyId },
    include: {
      _count: { select: { feedback: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await request.json();

  const project = await prisma.project.findFirst({
    where: { id, companyId: session.user.companyId },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.autoGeneratePrs !== undefined && { autoGeneratePrs: data.autoGeneratePrs }),
      ...(data.defaultBranch !== undefined && { defaultBranch: data.defaultBranch }),
    },
  });

  return NextResponse.json(updated);
}
```

**Step 3: Create projects list page**

Create `src/app/dashboard/projects/page.tsx`:
```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProjectsPage() {
  const session = await auth();

  const projects = await prisma.project.findMany({
    where: { companyId: session!.user.companyId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { feedback: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link
          href="/dashboard/projects/new"
          className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800"
        >
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500 mb-4">No projects yet.</p>
          <Link
            href="/dashboard/projects/new"
            className="text-sm bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{project.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{project.githubRepo}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{project._count.feedback}</p>
                  <p className="text-xs text-gray-500">feedback items</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 4: Create new project page**

Create `src/app/dashboard/projects/new/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        githubRepo: formData.get("githubRepo"),
        defaultBranch: formData.get("defaultBranch") || "main",
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Failed to create project");
      setLoading(false);
      return;
    }

    const project = await res.json();
    router.push(`/dashboard/projects/${project.id}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Project</h1>
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-lg">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Project name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="githubRepo" className="block text-sm font-medium text-gray-700 mb-1">
              GitHub repository (owner/repo)
            </label>
            <input
              id="githubRepo"
              name="githubRepo"
              type="text"
              required
              placeholder="acme/my-app"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="defaultBranch" className="block text-sm font-medium text-gray-700 mb-1">
              Default branch
            </label>
            <input
              id="defaultBranch"
              name="defaultBranch"
              type="text"
              defaultValue="main"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create project"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Step 5: Create project detail page with widget snippet**

Create `src/app/dashboard/projects/[id]/page.tsx`:
```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { WidgetSnippet } from "@/components/widget-snippet";
import { ProjectSettings } from "@/components/project-settings";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, companyId: session!.user.companyId },
    include: {
      _count: { select: { feedback: true } },
    },
  });

  if (!project) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-gray-500">{project.githubRepo}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/projects/${project.id}/feedback`}
            className="text-sm border px-3 py-1.5 rounded-md hover:bg-gray-50"
          >
            Feedback ({project._count.feedback})
          </Link>
          <Link
            href={`/dashboard/projects/${project.id}/prs`}
            className="text-sm border px-3 py-1.5 rounded-md hover:bg-gray-50"
          >
            Pull Requests
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        <WidgetSnippet siteKey={project.siteKey} />
        <ProjectSettings project={project} />
      </div>
    </div>
  );
}
```

**Step 6: Create widget snippet component**

Create `src/components/widget-snippet.tsx`:
```tsx
"use client";

import { useState } from "react";

export function WidgetSnippet({ siteKey }: { siteKey: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="https://cdn.feedbackiq.app/widget.js" data-site-key="${siteKey}"></script>`;

  async function copyToClipboard() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="font-semibold mb-2">Widget Snippet</h2>
      <p className="text-sm text-gray-500 mb-4">
        Add this script tag to your website to start collecting feedback.
      </p>
      <div className="relative">
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm overflow-x-auto">
          {snippet}
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
```

**Step 7: Create project settings component**

Create `src/components/project-settings.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
  autoGeneratePrs: boolean;
  defaultBranch: string;
}

export function ProjectSettings({ project }: { project: Project }) {
  const router = useRouter();
  const [autoGenerate, setAutoGenerate] = useState(project.autoGeneratePrs);
  const [saving, setSaving] = useState(false);

  async function toggleAutoGenerate() {
    setSaving(true);
    const newValue = !autoGenerate;

    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoGeneratePrs: newValue }),
    });

    setAutoGenerate(newValue);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="font-semibold mb-4">Settings</h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Auto-generate PRs</p>
          <p className="text-xs text-gray-500">
            Automatically create pull requests when feedback is submitted.
            When off, you review feedback first and trigger PR generation manually.
          </p>
        </div>
        <button
          onClick={toggleAutoGenerate}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoGenerate ? "bg-black" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoGenerate ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
```

**Step 8: Commit**

```bash
git add src/app/api/projects/ src/app/dashboard/projects/ src/components/widget-snippet.tsx src/components/project-settings.tsx
git commit -m "feat: add projects API, list, create, and detail pages"
```

---

## Task 7: Public Feedback Ingestion API

**Files:**
- Create: `src/app/api/v1/feedback/route.ts`

**Step 1: Create the public feedback endpoint**

Create `src/app/api/v1/feedback/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const origin = request.headers.get("origin") || "*";

  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const { site_key, content, email, source_url } = await request.json();

  if (!site_key || !content) {
    return NextResponse.json(
      { error: "site_key and content are required" },
      { status: 400, headers }
    );
  }

  if (content.length > 5000) {
    return NextResponse.json(
      { error: "Content must be under 5000 characters" },
      { status: 400, headers }
    );
  }

  const project = await prisma.project.findUnique({
    where: { siteKey: site_key },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Invalid site key" },
      { status: 401, headers }
    );
  }

  const feedback = await prisma.feedback.create({
    data: {
      projectId: project.id,
      content,
      submitterEmail: email || null,
      sourceUrl: source_url || null,
      status: project.autoGeneratePrs ? "generating" : "new",
    },
  });

  // If auto-generate is on, trigger the agent worker
  if (project.autoGeneratePrs) {
    // TODO: Task 10 - trigger agent worker
  }

  return NextResponse.json(
    { id: feedback.id, status: feedback.status },
    { status: 201, headers }
  );
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin") || "*";

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
```

**Step 2: Verify endpoint works**

Run:
```bash
curl -X POST http://localhost:3000/api/v1/feedback \
  -H "Content-Type: application/json" \
  -d '{"site_key": "test", "content": "test feedback"}'
```

Expected: 401 with "Invalid site key" (no project with that key exists).

**Step 3: Commit**

```bash
git add src/app/api/v1/
git commit -m "feat: add public feedback ingestion API with CORS and site key validation"
```

---

## Task 8: Dashboard Feedback Pages

**Files:**
- Create: `src/app/api/feedback/route.ts`
- Create: `src/app/api/feedback/[id]/route.ts`
- Create: `src/app/api/feedback/[id]/generate/route.ts`
- Create: `src/app/dashboard/projects/[id]/feedback/page.tsx`
- Create: `src/app/dashboard/projects/[id]/feedback/[feedbackId]/page.tsx`

**Step 1: Create authenticated feedback list API**

Create `src/app/api/feedback/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const feedback = await prisma.feedback.findMany({
    where: {
      project: {
        companyId: session.user.companyId,
        ...(projectId && { id: projectId }),
      },
    },
    include: {
      project: { select: { name: true } },
      pullRequests: { select: { id: true, githubPrUrl: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(feedback);
}
```

**Step 2: Create feedback detail API**

Create `src/app/api/feedback/[id]/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const feedback = await prisma.feedback.findFirst({
    where: {
      id,
      project: { companyId: session.user.companyId },
    },
    include: {
      project: { select: { name: true, githubRepo: true } },
      pullRequests: true,
    },
  });

  if (!feedback) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
  }

  return NextResponse.json(feedback);
}
```

**Step 3: Create generate PR trigger API**

Create `src/app/api/feedback/[id]/generate/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const feedback = await prisma.feedback.findFirst({
    where: {
      id,
      project: { companyId: session.user.companyId },
    },
    include: {
      project: { include: { company: true } },
    },
  });

  if (!feedback) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
  }

  if (feedback.status !== "new" && feedback.status !== "reviewing") {
    return NextResponse.json(
      { error: "Feedback is not in a state that allows PR generation" },
      { status: 400 }
    );
  }

  await prisma.feedback.update({
    where: { id },
    data: { status: "generating" },
  });

  // TODO: Task 10 - trigger agent worker
  // For now, return success with status update

  return NextResponse.json({ status: "generating" });
}
```

**Step 4: Create feedback list page for a project**

Create `src/app/dashboard/projects/[id]/feedback/page.tsx`:
```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProjectFeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, companyId: session!.user.companyId },
  });

  if (!project) notFound();

  const feedback = await prisma.feedback.findMany({
    where: { projectId: id },
    include: {
      pullRequests: { select: { id: true, githubPrUrl: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/dashboard/projects/${id}`} className="text-gray-500 hover:text-black text-sm">
          {project.name}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold">Feedback</h1>
      </div>

      {feedback.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">No feedback yet. Add the widget to your site to start collecting feedback.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {feedback.map((fb) => (
            <Link
              key={fb.id}
              href={`/dashboard/projects/${id}/feedback/${fb.id}`}
              className="block p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fb.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {fb.submitterEmail && (
                      <span className="text-xs text-gray-500">{fb.submitterEmail}</span>
                    )}
                    <span className="text-xs text-gray-400">{fb.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ml-4 ${
                  fb.status === "new" ? "bg-blue-100 text-blue-700" :
                  fb.status === "pr_created" ? "bg-green-100 text-green-700" :
                  fb.status === "generating" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {fb.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 5: Create feedback detail page with Generate PR button**

Create `src/app/dashboard/projects/[id]/feedback/[feedbackId]/page.tsx`:
```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GeneratePrButton } from "@/components/generate-pr-button";

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string; feedbackId: string }>;
}) {
  const session = await auth();
  const { id, feedbackId } = await params;

  const feedback = await prisma.feedback.findFirst({
    where: {
      id: feedbackId,
      projectId: id,
      project: { companyId: session!.user.companyId },
    },
    include: {
      project: { select: { name: true, githubRepo: true } },
      pullRequests: true,
    },
  });

  if (!feedback) notFound();

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/dashboard/projects/${id}`} className="text-gray-500 hover:text-black text-sm">
          {feedback.project.name}
        </Link>
        <span className="text-gray-300">/</span>
        <Link href={`/dashboard/projects/${id}/feedback`} className="text-gray-500 hover:text-black text-sm">
          Feedback
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-lg font-bold">Detail</h1>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs px-2 py-1 rounded-full ${
              feedback.status === "new" ? "bg-blue-100 text-blue-700" :
              feedback.status === "pr_created" ? "bg-green-100 text-green-700" :
              feedback.status === "generating" ? "bg-yellow-100 text-yellow-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {feedback.status}
            </span>
            <span className="text-xs text-gray-400">
              {feedback.createdAt.toLocaleString()}
            </span>
          </div>

          <p className="text-sm whitespace-pre-wrap">{feedback.content}</p>

          <div className="mt-4 pt-4 border-t text-xs text-gray-500 space-y-1">
            {feedback.submitterEmail && <p>From: {feedback.submitterEmail}</p>}
            {feedback.sourceUrl && <p>Page: {feedback.sourceUrl}</p>}
          </div>
        </div>

        {(feedback.status === "new" || feedback.status === "reviewing") && (
          <GeneratePrButton feedbackId={feedback.id} />
        )}

        {feedback.pullRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold mb-4">Pull Requests</h2>
            <ul className="space-y-3">
              {feedback.pullRequests.map((pr) => (
                <li key={pr.id} className="flex items-center justify-between">
                  <a
                    href={pr.githubPrUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {pr.branchName}
                  </a>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    pr.status === "open" ? "bg-green-100 text-green-700" :
                    pr.status === "merged" ? "bg-purple-100 text-purple-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {pr.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 6: Create Generate PR button component**

Create `src/components/generate-pr-button.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GeneratePrButton({ feedbackId }: { feedbackId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/feedback/${feedbackId}/generate`, {
      method: "POST",
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Failed to trigger PR generation");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="font-semibold mb-2">Generate Pull Request</h2>
      <p className="text-sm text-gray-500 mb-4">
        Our AI agent will analyze the codebase and create a PR addressing this feedback.
      </p>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>
      )}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate PR"}
      </button>
    </div>
  );
}
```

**Step 7: Commit**

```bash
git add src/app/api/feedback/ src/app/dashboard/projects/\[id\]/feedback/ src/components/generate-pr-button.tsx
git commit -m "feat: add feedback API, list page, detail page, and generate PR trigger"
```

---

## Task 9: GitHub App Integration

**Files:**
- Create: `src/lib/github.ts`
- Create: `src/app/api/github/install/route.ts`
- Create: `src/app/api/github/callback/route.ts`
- Create: `src/app/api/github/repos/route.ts`
- Create: `src/app/api/webhooks/github/route.ts`
- Create: `src/app/dashboard/settings/page.tsx`
- Create: `src/app/dashboard/settings/github/page.tsx`

**Step 1: Install GitHub dependencies**

Run:
```bash
npm install @octokit/app @octokit/rest jsonwebtoken && npm install --save-dev @types/jsonwebtoken
```

**Step 2: Create GitHub utility module**

Create `src/lib/github.ts`:
```typescript
import { App } from "@octokit/app";

let _app: App | null = null;

export function getGitHubApp(): App {
  if (!_app) {
    _app = new App({
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      webhooks: { secret: process.env.GITHUB_APP_WEBHOOK_SECRET! },
    });
  }
  return _app;
}

export async function getInstallationOctokit(installationId: number) {
  const app = getGitHubApp();
  return app.getInstallationOctokit(installationId);
}
```

**Step 3: Create GitHub App install redirect**

Create `src/app/api/github/install/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const appSlug = process.env.GITHUB_APP_SLUG || "feedbackiq";
  const installUrl = `https://github.com/apps/${appSlug}/installations/new`;

  return NextResponse.redirect(installUrl);
}
```

**Step 4: Create GitHub App callback handler**

Create `src/app/api/github/callback/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.redirect(new URL("/login", request.url));

  const { searchParams } = new URL(request.url);
  const installationId = searchParams.get("installation_id");

  if (!installationId) {
    return NextResponse.redirect(new URL("/dashboard/settings/github?error=missing_installation", request.url));
  }

  await prisma.company.update({
    where: { id: session.user.companyId },
    data: { githubInstallationId: parseInt(installationId) },
  });

  return NextResponse.redirect(new URL("/dashboard/settings/github?success=true", request.url));
}
```

**Step 5: Create repos list endpoint**

Create `src/app/api/github/repos/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInstallationOctokit } from "@/lib/github";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
  });

  if (!company?.githubInstallationId) {
    return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
  }

  const octokit = await getInstallationOctokit(company.githubInstallationId);

  const { data } = await octokit.request("GET /installation/repositories", {
    per_page: 100,
  });

  const repos = data.repositories.map((repo: any) => ({
    full_name: repo.full_name,
    name: repo.name,
    default_branch: repo.default_branch,
    private: repo.private,
  }));

  return NextResponse.json(repos);
}
```

**Step 6: Create GitHub webhook handler**

Create `src/app/api/webhooks/github/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const event = request.headers.get("x-github-event");
  const body = await request.json();

  if (event === "pull_request") {
    const prNumber = body.pull_request.number;
    const action = body.action; // opened, closed, merged

    const pr = await prisma.pullRequest.findFirst({
      where: { githubPrNumber: prNumber },
    });

    if (pr) {
      let status: "open" | "merged" | "closed" = "open";
      if (action === "closed" && body.pull_request.merged) {
        status = "merged";
      } else if (action === "closed") {
        status = "closed";
      }

      await prisma.pullRequest.update({
        where: { id: pr.id },
        data: { status },
      });

      if (status === "merged" || status === "closed") {
        await prisma.feedback.update({
          where: { id: pr.feedbackId },
          data: { status: "closed" },
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
```

**Step 7: Create settings page**

Create `src/app/dashboard/settings/page.tsx`:
```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();
  const company = await prisma.company.findUnique({
    where: { id: session!.user.companyId },
    include: { users: { select: { id: true, email: true, name: true, role: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold mb-2">Company</h2>
          <p className="text-sm text-gray-600">{company!.name}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">GitHub Integration</h2>
            <Link
              href="/dashboard/settings/github"
              className="text-sm text-blue-600 hover:underline"
            >
              {company!.githubInstallationId ? "Manage" : "Connect"}
            </Link>
          </div>
          <p className="text-sm text-gray-600">
            {company!.githubInstallationId
              ? "GitHub App is connected."
              : "Connect your GitHub to enable PR generation."}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold mb-4">Team Members</h2>
          <ul className="divide-y">
            {company!.users.map((user) => (
              <li key={user.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{user.name || user.email}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{user.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

**Step 8: Create GitHub settings page**

Create `src/app/dashboard/settings/github/page.tsx`:
```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function GitHubSettingsPage() {
  const session = await auth();
  const company = await prisma.company.findUnique({
    where: { id: session!.user.companyId },
  });

  const isConnected = !!company?.githubInstallationId;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/settings" className="text-gray-500 hover:text-black text-sm">
          Settings
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold">GitHub</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {isConnected ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 bg-green-500 rounded-full" />
              <p className="font-semibold">Connected</p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Installation ID: {company!.githubInstallationId}
            </p>
            <a
              href="/api/github/install"
              className="text-sm text-blue-600 hover:underline"
            >
              Manage repository access on GitHub
            </a>
          </div>
        ) : (
          <div>
            <p className="font-semibold mb-2">Not connected</p>
            <p className="text-sm text-gray-500 mb-4">
              Install the FeedbackIQ GitHub App to enable AI-generated pull requests.
            </p>
            <a
              href="/api/github/install"
              className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 inline-block"
            >
              Connect GitHub
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 9: Commit**

```bash
git add src/lib/github.ts src/app/api/github/ src/app/api/webhooks/ src/app/dashboard/settings/ package.json package-lock.json
git commit -m "feat: add GitHub App integration, webhook handler, and settings pages"
```

---

## Task 10: Agent Worker (Claude Agent SDK + PR Generation)

**Files:**
- Create: `src/lib/agent.ts`
- Create: `src/lib/agent-tools.ts`
- Modify: `src/app/api/feedback/[id]/generate/route.ts` (wire up agent)
- Modify: `src/app/api/v1/feedback/route.ts` (wire up auto-generate)

**Step 1: Install Claude Agent SDK**

Run:
```bash
npm install @anthropic-ai/sdk
```

Note: Check latest Claude Agent SDK docs. The package name may differ. Use `@anthropic-ai/sdk` for the standard SDK and implement the agent loop manually with tool use.

**Step 2: Create agent tools (GitHub-backed)**

Create `src/lib/agent-tools.ts`:
```typescript
import type { Octokit } from "@octokit/rest";

export interface FileChange {
  path: string;
  content: string;
}

export function createAgentTools(octokit: Octokit, owner: string, repo: string, ref: string) {
  return {
    async readFile(path: string): Promise<string> {
      try {
        const { data } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
          owner,
          repo,
          path,
          ref,
        });
        if ("content" in data && data.content) {
          return Buffer.from(data.content, "base64").toString("utf-8");
        }
        return "[Binary or empty file]";
      } catch {
        return "[File not found]";
      }
    },

    async listDirectory(path: string): Promise<string[]> {
      try {
        const { data } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
          owner,
          repo,
          path,
          ref,
        });
        if (Array.isArray(data)) {
          return data.map((item: any) => `${item.type === "dir" ? "dir" : "file"}: ${item.path}`);
        }
        return ["[Not a directory]"];
      } catch {
        return ["[Directory not found]"];
      }
    },

    async searchCode(query: string): Promise<string[]> {
      try {
        const { data } = await octokit.request("GET /search/code", {
          q: `${query} repo:${owner}/${repo}`,
          per_page: 10,
        });
        return data.items.map((item: any) => item.path);
      } catch {
        return ["[Search failed]"];
      }
    },
  };
}
```

**Step 3: Create agent orchestration**

Create `src/lib/agent.ts`:
```typescript
import Anthropic from "@anthropic-ai/sdk";
import { getInstallationOctokit } from "@/lib/github";
import { createAgentTools, type FileChange } from "@/lib/agent-tools";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic();

const MAX_FILES = 10;
const MAX_ITERATIONS = 20;

const tools: Anthropic.Tool[] = [
  {
    name: "read_file",
    description: "Read the contents of a file in the repository",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "File path relative to repo root" },
      },
      required: ["path"],
    },
  },
  {
    name: "list_directory",
    description: "List files and subdirectories in a directory",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "Directory path relative to repo root (use '' for root)" },
      },
      required: ["path"],
    },
  },
  {
    name: "search_code",
    description: "Search for code in the repository by keyword",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
      },
      required: ["query"],
    },
  },
  {
    name: "propose_changes",
    description: "Propose file changes to address the feedback. Call this when you have determined what changes to make.",
    input_schema: {
      type: "object" as const,
      properties: {
        changes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              path: { type: "string", description: "File path" },
              content: { type: "string", description: "Complete new file content" },
            },
            required: ["path", "content"],
          },
          description: "List of file changes",
        },
        summary: { type: "string", description: "Summary of what was changed and why" },
      },
      required: ["changes", "summary"],
    },
  },
];

export async function runAgent(feedbackId: string): Promise<void> {
  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    include: {
      project: { include: { company: true } },
    },
  });

  if (!feedback || !feedback.project.company.githubInstallationId) {
    throw new Error("Feedback not found or GitHub not connected");
  }

  const { project } = feedback;
  const [owner, repo] = project.githubRepo.split("/");
  const installationId = project.company.githubInstallationId;

  const octokit = await getInstallationOctokit(installationId);
  const agentTools = createAgentTools(octokit as any, owner, repo, project.defaultBranch);

  const systemPrompt = `You are a software engineer working on the ${owner}/${repo} repository.

A user submitted this feedback from ${feedback.sourceUrl || "the application"}:

"${feedback.content}"

Your job:
1. Explore the repository to understand its structure and relevant code
2. Identify the files that need to change to address this feedback
3. Create minimal, focused changes that address the feedback
4. Call propose_changes with your changes and a summary

Rules:
- Only change what's necessary. Keep changes minimal and focused.
- Do not change more than ${MAX_FILES} files.
- Maintain the existing code style and conventions.
- If the feedback is unclear or impossible to implement, propose_changes with an empty changes array and explain why in the summary.`;

  const log: string[] = [];
  let messages: Anthropic.MessageParam[] = [
    { role: "user", content: "Please analyze the repository and address the feedback described in your instructions. Start by listing the root directory to understand the project structure." },
  ];

  let proposedChanges: FileChange[] | null = null;
  let changeSummary = "";

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages,
    });

    log.push(`[Iteration ${i + 1}] Stop reason: ${response.stop_reason}`);

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text") log.push(textBlock.text);
      break;
    }

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.MessageParam[] = [];
      const assistantContent = response.content;

      const toolUseResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of assistantContent) {
        if (block.type !== "tool_use") continue;

        log.push(`[Tool] ${block.name}(${JSON.stringify(block.input)})`);

        let result: string;

        switch (block.name) {
          case "read_file":
            result = await agentTools.readFile((block.input as any).path);
            break;
          case "list_directory":
            const entries = await agentTools.listDirectory((block.input as any).path);
            result = entries.join("\n");
            break;
          case "search_code":
            const files = await agentTools.searchCode((block.input as any).query);
            result = files.join("\n");
            break;
          case "propose_changes":
            const input = block.input as any;
            proposedChanges = input.changes;
            changeSummary = input.summary;
            result = "Changes recorded. Proceeding to create PR.";
            log.push(`[Changes] ${changeSummary}`);
            break;
          default:
            result = "Unknown tool";
        }

        toolUseResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }

      messages.push({ role: "assistant", content: assistantContent });
      messages.push({ role: "user", content: toolUseResults });

      if (proposedChanges !== null) break;
    }
  }

  if (!proposedChanges || proposedChanges.length === 0) {
    await prisma.feedback.update({
      where: { id: feedbackId },
      data: { status: "closed" },
    });
    await prisma.pullRequest.create({
      data: {
        feedbackId,
        branchName: `feedbackiq/feedback-${feedbackId.slice(0, 8)}`,
        status: "closed",
        agentLog: log.join("\n") + "\n\n[Result] No changes proposed: " + changeSummary,
      },
    });
    return;
  }

  // Create branch and PR
  const branchName = `feedbackiq/feedback-${feedbackId.slice(0, 8)}`;

  // Get the SHA of the default branch
  const { data: refData } = await octokit.request("GET /repos/{owner}/{repo}/git/ref/{ref}", {
    owner,
    repo,
    ref: `heads/${project.defaultBranch}`,
  });
  const baseSha = refData.object.sha;

  // Create branch
  await octokit.request("POST /repos/{owner}/{repo}/git/refs", {
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: baseSha,
  });

  // Commit each file change
  for (const change of proposedChanges) {
    // Check if file exists to get its sha
    let fileSha: string | undefined;
    try {
      const { data: existingFile } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner,
        repo,
        path: change.path,
        ref: branchName,
      });
      if ("sha" in existingFile) {
        fileSha = existingFile.sha;
      }
    } catch {
      // File doesn't exist, that's fine
    }

    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path: change.path,
      message: `feedbackiq: update ${change.path}`,
      content: Buffer.from(change.content).toString("base64"),
      branch: branchName,
      ...(fileSha && { sha: fileSha }),
    });
  }

  // Create pull request
  const { data: pr } = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
    owner,
    repo,
    title: `[FeedbackIQ] ${feedback.content.slice(0, 60)}${feedback.content.length > 60 ? "..." : ""}`,
    head: branchName,
    base: project.defaultBranch,
    body: `## Feedback\n\n> ${feedback.content}\n\n${feedback.sourceUrl ? `**Source page:** ${feedback.sourceUrl}\n\n` : ""}## Changes\n\n${changeSummary}\n\n---\n*Generated by [FeedbackIQ](https://feedbackiq.app)*`,
  });

  // Save PR record and update feedback status
  await prisma.pullRequest.create({
    data: {
      feedbackId,
      githubPrUrl: pr.html_url,
      githubPrNumber: pr.number,
      branchName,
      status: "open",
      agentLog: log.join("\n"),
    },
  });

  await prisma.feedback.update({
    where: { id: feedbackId },
    data: { status: "pr_created" },
  });
}
```

**Step 4: Wire up the generate endpoint**

Update `src/app/api/feedback/[id]/generate/route.ts` -- replace the TODO comment with:
```typescript
import { runAgent } from "@/lib/agent";

// Inside the POST handler, after updating status to "generating":
// Replace the TODO line with:
runAgent(id).catch(async (err) => {
  console.error("Agent error:", err);
  await prisma.feedback.update({
    where: { id },
    data: { status: "new" },
  });
});
```

The full updated file:
```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runAgent } from "@/lib/agent";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const feedback = await prisma.feedback.findFirst({
    where: {
      id,
      project: { companyId: session.user.companyId },
    },
    include: {
      project: { include: { company: true } },
    },
  });

  if (!feedback) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
  }

  if (feedback.status !== "new" && feedback.status !== "reviewing") {
    return NextResponse.json(
      { error: "Feedback is not in a state that allows PR generation" },
      { status: 400 }
    );
  }

  await prisma.feedback.update({
    where: { id },
    data: { status: "generating" },
  });

  // Fire and forget -- agent runs in background
  runAgent(id).catch(async (err) => {
    console.error("Agent error:", err);
    await prisma.feedback.update({
      where: { id },
      data: { status: "new" },
    });
  });

  return NextResponse.json({ status: "generating" });
}
```

**Step 5: Wire up auto-generate in public feedback endpoint**

Update `src/app/api/v1/feedback/route.ts` -- replace the TODO with:
```typescript
import { runAgent } from "@/lib/agent";

// After creating feedback, inside the autoGeneratePrs check:
if (project.autoGeneratePrs) {
  runAgent(feedback.id).catch(async (err) => {
    console.error("Agent error:", err);
    await prisma.feedback.update({
      where: { id: feedback.id },
      data: { status: "new" },
    });
  });
}
```

**Step 6: Commit**

```bash
git add src/lib/agent.ts src/lib/agent-tools.ts src/app/api/feedback/\[id\]/generate/ src/app/api/v1/feedback/ package.json package-lock.json
git commit -m "feat: add Claude Agent SDK integration for PR generation"
```

---

## Task 11: Pull Requests Dashboard Pages

**Files:**
- Create: `src/app/api/pull-requests/route.ts`
- Create: `src/app/api/pull-requests/[id]/route.ts`
- Create: `src/app/dashboard/projects/[id]/prs/page.tsx`

**Step 1: Create pull requests list API**

Create `src/app/api/pull-requests/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const prs = await prisma.pullRequest.findMany({
    where: {
      feedback: {
        project: {
          companyId: session.user.companyId,
          ...(projectId && { id: projectId }),
        },
      },
    },
    include: {
      feedback: {
        select: { content: true, project: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(prs);
}
```

**Step 2: Create pull request detail API**

Create `src/app/api/pull-requests/[id]/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const pr = await prisma.pullRequest.findFirst({
    where: {
      id,
      feedback: { project: { companyId: session.user.companyId } },
    },
    include: {
      feedback: {
        select: { content: true, sourceUrl: true, project: { select: { name: true, githubRepo: true } } },
      },
    },
  });

  if (!pr) {
    return NextResponse.json({ error: "Pull request not found" }, { status: 404 });
  }

  return NextResponse.json(pr);
}
```

**Step 3: Create PRs list page for a project**

Create `src/app/dashboard/projects/[id]/prs/page.tsx`:
```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProjectPRsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, companyId: session!.user.companyId },
  });

  if (!project) notFound();

  const prs = await prisma.pullRequest.findMany({
    where: { feedback: { projectId: id } },
    include: {
      feedback: { select: { content: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/dashboard/projects/${id}`} className="text-gray-500 hover:text-black text-sm">
          {project.name}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold">Pull Requests</h1>
      </div>

      {prs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">No pull requests yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {prs.map((pr) => (
            <div key={pr.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {pr.githubPrUrl ? (
                      <a
                        href={pr.githubPrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {pr.branchName}
                      </a>
                    ) : (
                      <span className="text-sm font-medium">{pr.branchName}</span>
                    )}
                    {pr.githubPrNumber && (
                      <span className="text-xs text-gray-400">#{pr.githubPrNumber}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {pr.feedback.content}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ml-4 ${
                  pr.status === "open" ? "bg-green-100 text-green-700" :
                  pr.status === "merged" ? "bg-purple-100 text-purple-700" :
                  pr.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {pr.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/api/pull-requests/ src/app/dashboard/projects/\[id\]/prs/
git commit -m "feat: add pull requests API and dashboard page"
```

---

## Task 12: Embeddable Widget

**Files:**
- Create: `widget/src/widget.ts`
- Create: `widget/src/styles.ts`
- Create: `widget/tsconfig.json`
- Create: `widget/build.ts`
- Modify: `package.json` (add widget build script)

**Step 1: Create widget directory and config**

Run:
```bash
mkdir -p widget/src
```

Create `widget/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "outDir": "dist",
    "declaration": false
  },
  "include": ["src"]
}
```

**Step 2: Install esbuild for widget bundling**

Run:
```bash
npm install --save-dev esbuild
```

**Step 3: Create widget styles**

Create `widget/src/styles.ts`:
```typescript
export const STYLES = `
  :host {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .fiq-trigger {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #000;
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    z-index: 2147483647;
    transition: transform 0.2s;
  }

  .fiq-trigger:hover {
    transform: scale(1.1);
  }

  .fiq-trigger svg {
    width: 24px;
    height: 24px;
  }

  .fiq-panel {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 360px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
    z-index: 2147483647;
    overflow: hidden;
    animation: fiq-slide-up 0.2s ease-out;
  }

  @keyframes fiq-slide-up {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .fiq-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
  }

  .fiq-header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #000;
  }

  .fiq-header p {
    margin: 4px 0 0;
    font-size: 13px;
    color: #666;
  }

  .fiq-body {
    padding: 16px;
  }

  .fiq-textarea {
    width: 100%;
    min-height: 120px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    box-sizing: border-box;
  }

  .fiq-textarea:focus {
    outline: none;
    border-color: #000;
  }

  .fiq-email {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    margin-top: 8px;
    box-sizing: border-box;
  }

  .fiq-email:focus {
    outline: none;
    border-color: #000;
  }

  .fiq-submit {
    width: 100%;
    padding: 10px;
    background: #000;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 12px;
  }

  .fiq-submit:hover {
    background: #222;
  }

  .fiq-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .fiq-success {
    text-align: center;
    padding: 32px 16px;
  }

  .fiq-success p {
    margin: 0;
    font-size: 15px;
    color: #000;
    font-weight: 500;
  }

  .fiq-success span {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    color: #666;
  }

  .fiq-hidden {
    display: none;
  }
`;
```

**Step 4: Create widget main file**

Create `widget/src/widget.ts`:
```typescript
import { STYLES } from "./styles";

const API_URL = "https://feedbackiq.app/api/v1/feedback";

const CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>`;

class FeedbackIQWidget {
  private shadow: ShadowRoot;
  private siteKey: string;
  private isOpen = false;

  constructor(siteKey: string) {
    this.siteKey = siteKey;

    const host = document.createElement("div");
    host.id = "feedbackiq-widget";
    this.shadow = host.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = STYLES;
    this.shadow.appendChild(style);

    this.render();
    document.body.appendChild(host);
  }

  private render() {
    // Trigger button
    const trigger = document.createElement("button");
    trigger.className = "fiq-trigger";
    trigger.innerHTML = CHAT_ICON;
    trigger.addEventListener("click", () => this.toggle());
    this.shadow.appendChild(trigger);

    // Panel
    const panel = document.createElement("div");
    panel.className = "fiq-panel fiq-hidden";
    panel.innerHTML = `
      <div class="fiq-header">
        <h3>Share your feedback</h3>
        <p>Be specific so our AI can build it for you</p>
      </div>
      <div class="fiq-body">
        <textarea class="fiq-textarea" placeholder="Describe what you'd like to see changed — be as detailed as possible..."></textarea>
        <input class="fiq-email" type="email" placeholder="Email (optional)" />
        <button class="fiq-submit">Submit Feedback</button>
      </div>
    `;
    this.shadow.appendChild(panel);

    // Success view
    const success = document.createElement("div");
    success.className = "fiq-panel fiq-hidden";
    success.setAttribute("data-success", "true");
    success.innerHTML = `
      <div class="fiq-success">
        <p>Thank you!</p>
        <span>Your feedback has been submitted.</span>
      </div>
    `;
    this.shadow.appendChild(success);

    // Submit handler
    const submitBtn = panel.querySelector(".fiq-submit") as HTMLButtonElement;
    const textarea = panel.querySelector(".fiq-textarea") as HTMLTextAreaElement;
    const emailInput = panel.querySelector(".fiq-email") as HTMLInputElement;

    submitBtn.addEventListener("click", async () => {
      const content = textarea.value.trim();
      if (!content) return;

      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      try {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            site_key: this.siteKey,
            content,
            email: emailInput.value.trim() || undefined,
            source_url: window.location.href,
          }),
        });

        panel.classList.add("fiq-hidden");
        success.classList.remove("fiq-hidden");

        setTimeout(() => {
          success.classList.add("fiq-hidden");
          this.isOpen = false;
          textarea.value = "";
          emailInput.value = "";
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Feedback";
        }, 3000);
      } catch {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Feedback";
      }
    });
  }

  private toggle() {
    this.isOpen = !this.isOpen;
    const panel = this.shadow.querySelector(".fiq-panel:not([data-success])") as HTMLElement;
    if (this.isOpen) {
      panel.classList.remove("fiq-hidden");
    } else {
      panel.classList.add("fiq-hidden");
    }
  }
}

// Auto-init
(function () {
  const script = document.currentScript as HTMLScriptElement;
  if (!script) return;

  const siteKey = script.getAttribute("data-site-key");
  if (!siteKey) {
    console.error("[FeedbackIQ] Missing data-site-key attribute");
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new FeedbackIQWidget(siteKey));
  } else {
    new FeedbackIQWidget(siteKey);
  }
})();
```

**Step 5: Create build script**

Create `widget/build.ts`:
```typescript
import * as esbuild from "esbuild";

esbuild.buildSync({
  entryPoints: ["widget/src/widget.ts"],
  bundle: true,
  minify: true,
  outfile: "public/widget.js",
  format: "iife",
  target: "es2020",
});

console.log("Widget built to public/widget.js");
```

**Step 6: Add build script to package.json**

Add to `package.json` scripts:
```json
"build:widget": "npx tsx widget/build.ts"
```

**Step 7: Build the widget**

Run:
```bash
npm run build:widget
```

Expected: `public/widget.js` created, minified, single file.

**Step 8: Commit**

```bash
git add widget/ public/widget.js package.json
git commit -m "feat: add embeddable feedback widget with Shadow DOM"
```

---

## Task 13: Landing Page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Create landing page**

Replace `src/app/page.tsx`:
```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <span className="font-bold text-lg">FeedbackIQ</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-black">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4">
        <section className="py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Turn user feedback<br />into pull requests
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Drop a widget on your site. Collect feedback from users.
            Our AI agent reads your codebase and creates a PR — automatically.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-black text-white px-8 py-3 rounded-md text-lg hover:bg-gray-800"
          >
            Start for free
          </Link>
        </section>

        <section className="py-16">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-3">1</div>
              <h3 className="font-semibold mb-2">Add the widget</h3>
              <p className="text-sm text-gray-600">
                One script tag on your site. Users see a feedback button in the corner.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">2</div>
              <h3 className="font-semibold mb-2">Collect feedback</h3>
              <p className="text-sm text-gray-600">
                Users describe what they want changed. The more detail, the better the PR.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">3</div>
              <h3 className="font-semibold mb-2">Review the PR</h3>
              <p className="text-sm text-gray-600">
                Our AI reads your codebase, makes the changes, and opens a pull request.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 text-center border-t">
          <h2 className="text-2xl font-bold mb-4">Ready to ship faster?</h2>
          <Link
            href="/signup"
            className="inline-block bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800"
          >
            Get started
          </Link>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          FeedbackIQ
        </div>
      </footer>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add landing page"
```

---

## Task 14: Database Migration and Environment Setup

**Step 1: Set up Neon database**

Create a Neon project at neon.tech, get the connection string.

**Step 2: Configure .env**

Create `.env.local`:
```env
DATABASE_URL=<your-neon-connection-string>
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
```

**Step 3: Run initial migration**

Run:
```bash
npx prisma migrate dev --name init
```

Expected: Migration created and applied, all tables created.

**Step 4: Verify with Prisma Studio**

Run:
```bash
npx prisma studio
```

Expected: Opens browser showing all tables: Company, User, Project, Feedback, PullRequest.

**Step 5: Commit migration**

```bash
git add prisma/migrations/
git commit -m "feat: add initial database migration"
```

---

## Task 15: Vercel Deployment Setup

**Step 1: Install Vercel CLI if needed**

Run:
```bash
npm install -g vercel
```

**Step 2: Link project to Vercel**

Run:
```bash
vercel link
```

**Step 3: Set environment variables on Vercel**

Run:
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add GITHUB_APP_ID
vercel env add GITHUB_APP_PRIVATE_KEY
vercel env add GITHUB_APP_CLIENT_ID
vercel env add GITHUB_APP_CLIENT_SECRET
vercel env add GITHUB_APP_WEBHOOK_SECRET
vercel env add ANTHROPIC_API_KEY
```

**Step 4: Update next.config.ts for widget build**

Add to `package.json` scripts:
```json
"vercel-build": "npm run build:widget && next build"
```

**Step 5: Deploy**

Run:
```bash
vercel --prod
```

**Step 6: Commit any config changes**

```bash
git add package.json vercel.json next.config.ts
git commit -m "feat: add Vercel deployment configuration"
```

---

## Summary

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | Project scaffolding | None |
| 2 | Database schema (Prisma) | Task 1 |
| 3 | Authentication (NextAuth v5) | Task 2 |
| 4 | Signup and login pages | Task 3 |
| 5 | Dashboard layout and overview | Task 3 |
| 6 | Projects API and pages | Task 5 |
| 7 | Public feedback API | Task 2 |
| 8 | Dashboard feedback pages | Task 6, 7 |
| 9 | GitHub App integration | Task 2 |
| 10 | Agent worker (Claude SDK) | Task 9 |
| 11 | Pull requests pages | Task 10 |
| 12 | Embeddable widget | Task 7 |
| 13 | Landing page | Task 1 |
| 14 | Database migration | Task 2 |
| 15 | Vercel deployment | All |

**Parallelizable groups:**
- Tasks 4, 5, 7, 12, 13 can run in parallel (no interdependencies beyond Task 2/3)
- Tasks 6 and 9 can run in parallel
- Tasks 10 and 8 can run in parallel once their deps are met
