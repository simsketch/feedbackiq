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

export async function mintInstallationToken(
  installationId: number
): Promise<string> {
  const app = getGitHubApp();
  const { data } = await app.octokit.request(
    "POST /app/installations/{installation_id}/access_tokens",
    { installation_id: installationId }
  );
  return data.token;
}
