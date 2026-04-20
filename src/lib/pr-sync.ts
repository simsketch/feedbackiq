import { prisma } from "@/lib/prisma";
import { getInstallationOctokit } from "@/lib/github";
import { maybeGenerateChangelogEntry } from "@/lib/changelog";

export async function syncOpenPRsForProject(projectId: string): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { company: true },
  });
  if (!project?.company.githubInstallationId) return;

  const [owner, repo] = project.githubRepo.split("/");
  if (!owner || !repo) return;

  const openPrs = await prisma.pullRequest.findMany({
    where: {
      status: "open",
      feedback: { projectId },
    },
  });
  if (openPrs.length === 0) return;

  let octokit;
  try {
    octokit = await getInstallationOctokit(project.company.githubInstallationId);
  } catch (err) {
    console.error("syncOpenPRsForProject octokit failed", err);
    return;
  }

  const mergedPrIds: string[] = [];

  for (const pr of openPrs) {
    if (!pr.githubPrNumber) continue;
    try {
      const { data: ghPr } = await octokit.request(
        "GET /repos/{owner}/{repo}/pulls/{pull_number}",
        { owner, repo, pull_number: pr.githubPrNumber }
      );
      const newStatus =
        ghPr.state === "closed"
          ? ghPr.merged_at
            ? "merged"
            : "closed"
          : "open";
      if (newStatus === "open") continue;

      await prisma.pullRequest.update({
        where: { id: pr.id },
        data: { status: newStatus },
      });
      await prisma.feedback.update({
        where: { id: pr.feedbackId },
        data: { status: "closed" },
      });
      if (newStatus === "merged") mergedPrIds.push(pr.id);
    } catch (err) {
      console.error("syncOpenPRsForProject pr check failed", pr.id, err);
    }
  }

  for (const prId of mergedPrIds) {
    try {
      await maybeGenerateChangelogEntry(prId);
    } catch (err) {
      console.error("changelog generation failed", prId, err);
    }
  }
}
