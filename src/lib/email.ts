import { Resend } from "resend";

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
