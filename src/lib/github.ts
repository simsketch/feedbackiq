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
