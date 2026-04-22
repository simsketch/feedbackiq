import { Resend } from "resend";
import { SITE_URL } from "./seo";
import type { DripIssue } from "@/content/waitlist-drips";

const FROM = process.env.RESEND_FROM || "FeedbackIQ <changelog@feedbackiq.app>";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

interface NotificationInput {
  to: string;
  projectName: string;
  title: string;
  body: string;
  publicUrl: string | null;
  prUrl: string | null;
}

export async function sendChangelogNotification(
  input: NotificationInput
): Promise<{ sent: boolean; reason?: string }> {
  const client = getClient();
  if (!client) return { sent: false, reason: "RESEND_API_KEY not set" };

  const subject = `${input.projectName}: ${input.title}`;
  const html = renderHtml(input);
  const text = renderText(input);

  const { error } = await client.emails.send({
    from: FROM,
    to: input.to,
    subject,
    html,
    text,
  });

  if (error) return { sent: false, reason: error.message };
  return { sent: true };
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderHtml(input: NotificationInput): string {
  const title = escape(input.title);
  const body = escape(input.body);
  const projectName = escape(input.projectName);
  const link = input.publicUrl
    ? `<p style="margin:24px 0 0;"><a href="${input.publicUrl}" style="color:#0891b2;text-decoration:none;">See the full changelog</a></p>`
    : "";

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <p style="font-size:13px;color:#71717a;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.06em;">${projectName} · Shipped</p>
    <h1 style="font-size:22px;font-weight:600;line-height:1.3;margin:0 0 12px;">${title}</h1>
    <p style="font-size:15px;line-height:1.6;color:#3f3f46;margin:0;">${body}</p>
    ${link}
    <hr style="border:0;border-top:1px solid #e4e4e7;margin:32px 0 16px;" />
    <p style="font-size:12px;color:#a1a1aa;margin:0;">You're receiving this because you submitted feedback on ${projectName}. Thanks for helping make it better.</p>
  </div>
</body>
</html>`;
}

export async function sendWaitlistWelcome(
  to: string
): Promise<{ sent: boolean; reason?: string }> {
  const client = getClient();
  if (!client) return { sent: false, reason: "RESEND_API_KEY not set" };

  const { error } = await client.emails.send({
    from: FROM,
    to,
    subject: "You're on the FeedbackIQ list",
    html: waitlistHtml(),
    text: waitlistText(),
  });

  if (error) return { sent: false, reason: error.message };
  return { sent: true };
}

function waitlistHtml(): string {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <p style="font-size:13px;color:#71717a;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.06em;">FeedbackIQ</p>
    <h1 style="font-size:24px;font-weight:600;line-height:1.3;margin:0 0 16px;">You're on the list.</h1>
    <p style="font-size:15px;line-height:1.7;color:#3f3f46;margin:0 0 16px;">Thanks for signing up. We're building the tool that turns user feedback into real pull requests — drop a widget on your site, users tell you what to build, an AI agent reads your codebase and opens the PR.</p>
    <p style="font-size:15px;line-height:1.7;color:#3f3f46;margin:0 0 16px;">Expect a short note when we open early access. In the meantime, we're writing about the build publicly:</p>
    <p style="margin:24px 0 0;"><a href="https://feedbackiq.app/blog" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:500;">Read the build log</a></p>
    <hr style="border:0;border-top:1px solid #e4e4e7;margin:40px 0 16px;" />
    <p style="font-size:12px;color:#a1a1aa;margin:0;">You're receiving this because you joined the FeedbackIQ waitlist. Reply to unsubscribe.</p>
  </div>
</body>
</html>`;
}

export async function sendDripIssue(
  to: string,
  issue: DripIssue,
  unsubscribeUrl: string
): Promise<{ sent: boolean; reason?: string }> {
  const client = getClient();
  if (!client) return { sent: false, reason: "RESEND_API_KEY not set" };

  const { error } = await client.emails.send({
    from: FROM,
    to,
    subject: issue.subject,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    html: dripHtml(issue, unsubscribeUrl),
    text: dripText(issue, unsubscribeUrl),
  });

  if (error) return { sent: false, reason: error.message };
  return { sent: true };
}

function dripHtml(issue: DripIssue, unsubscribeUrl: string): string {
  const cta = issue.cta
    ? `<p style="margin:28px 0 0;"><a href="${SITE_URL}${issue.cta.href}" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:500;">${escape(issue.cta.label)}</a></p>`
    : "";
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <p style="font-size:13px;color:#71717a;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.06em;">FeedbackIQ · Issue ${issue.sequenceNumber}</p>
    <h1 style="font-size:22px;font-weight:600;line-height:1.3;margin:0 0 18px;">${escape(issue.headline)}</h1>
    <div style="font-size:15px;line-height:1.7;color:#3f3f46;">${issue.bodyHtml}</div>
    ${cta}
    <hr style="border:0;border-top:1px solid #e4e4e7;margin:40px 0 16px;" />
    <p style="font-size:12px;color:#a1a1aa;margin:0;">You're receiving this because you joined the FeedbackIQ waitlist. <a href="${unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a>.</p>
  </div>
</body>
</html>`;
}

function dripText(issue: DripIssue, unsubscribeUrl: string): string {
  const parts = [
    `FeedbackIQ · Issue ${issue.sequenceNumber}`,
    "",
    issue.headline,
    "",
    issue.bodyText,
  ];
  if (issue.cta) {
    parts.push("", `${issue.cta.label}: ${SITE_URL}${issue.cta.href}`);
  }
  parts.push("", `Unsubscribe: ${unsubscribeUrl}`);
  return parts.join("\n");
}

interface BlogBroadcastInput {
  to: string;
  postTitle: string;
  postDescription: string;
  postUrl: string;
  heroImageUrl?: string | null;
  unsubscribeUrl: string;
}

export async function sendBlogBroadcast(
  input: BlogBroadcastInput
): Promise<{ sent: boolean; reason?: string }> {
  const client = getClient();
  if (!client) return { sent: false, reason: "RESEND_API_KEY not set" };

  const { error } = await client.emails.send({
    from: FROM,
    to: input.to,
    subject: `New post: ${input.postTitle}`,
    headers: {
      "List-Unsubscribe": `<${input.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    html: broadcastHtml(input),
    text: broadcastText(input),
  });

  if (error) return { sent: false, reason: error.message };
  return { sent: true };
}

function broadcastHtml(input: BlogBroadcastInput): string {
  const hero = input.heroImageUrl
    ? `<img src="${input.heroImageUrl}" alt="" style="width:100%;height:auto;border-radius:12px;margin:0 0 20px;" />`
    : "";
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <p style="font-size:13px;color:#71717a;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.06em;">FeedbackIQ · New post</p>
    ${hero}
    <h1 style="font-size:22px;font-weight:600;line-height:1.3;margin:0 0 12px;">${escape(input.postTitle)}</h1>
    <p style="font-size:15px;line-height:1.6;color:#3f3f46;margin:0 0 24px;">${escape(input.postDescription)}</p>
    <p style="margin:0;"><a href="${input.postUrl}" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:500;">Read the post</a></p>
    <hr style="border:0;border-top:1px solid #e4e4e7;margin:40px 0 16px;" />
    <p style="font-size:12px;color:#a1a1aa;margin:0;">You're on the FeedbackIQ waitlist. <a href="${input.unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a>.</p>
  </div>
</body>
</html>`;
}

function broadcastText(input: BlogBroadcastInput): string {
  return [
    "FeedbackIQ · New post",
    "",
    input.postTitle,
    "",
    input.postDescription,
    "",
    `Read the post: ${input.postUrl}`,
    "",
    `Unsubscribe: ${input.unsubscribeUrl}`,
  ].join("\n");
}

function waitlistText(): string {
  return [
    "FeedbackIQ",
    "",
    "You're on the list.",
    "",
    "Thanks for signing up. We're building the tool that turns user feedback into real pull requests — drop a widget on your site, users tell you what to build, an AI agent reads your codebase and opens the PR.",
    "",
    "Expect a short note when we open early access. In the meantime, we're writing about the build publicly: https://feedbackiq.app/blog",
    "",
    "You're receiving this because you joined the FeedbackIQ waitlist. Reply to unsubscribe.",
  ].join("\n");
}

function renderText(input: NotificationInput): string {
  const parts = [
    `${input.projectName} · Shipped`,
    "",
    input.title,
    "",
    input.body,
  ];
  if (input.publicUrl) parts.push("", `See the full changelog: ${input.publicUrl}`);
  parts.push("", `You're receiving this because you submitted feedback on ${input.projectName}.`);
  return parts.join("\n");
}
