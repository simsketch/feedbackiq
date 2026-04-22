import { prisma } from "./prisma";
import { sendDripIssue } from "./email";
import { getUnsubscribeUrl } from "./unsubscribe";
import {
  computeTargetSequence,
  DRIP_ISSUES,
  TOTAL_DRIP_ISSUES,
  getDripIssue,
} from "@/content/waitlist-drips";

export interface DripResult {
  subscribers: number;
  sent: number;
  errors: number;
  errorDetails: Array<{ email: string; seq: number; message: string }>;
}

export async function runWaitlistDrip(): Promise<DripResult> {
  if (DRIP_ISSUES.length === 0) {
    return { subscribers: 0, sent: 0, errors: 0, errorDetails: [] };
  }

  const subscribers = await prisma.waitlistSignup.findMany({
    where: { unsubscribed: false },
    select: {
      id: true,
      email: true,
      createdAt: true,
      sends: { select: { sequenceNumber: true } },
    },
  });

  const now = new Date();
  let sent = 0;
  let errors = 0;
  const errorDetails: DripResult["errorDetails"] = [];

  for (const sub of subscribers) {
    const target = computeTargetSequence(sub.createdAt, now);
    if (target < 1) continue;

    const sentSet = new Set(sub.sends.map((s) => s.sequenceNumber));

    for (let seq = 1; seq <= Math.min(target, TOTAL_DRIP_ISSUES); seq++) {
      if (sentSet.has(seq)) continue;
      const issue = getDripIssue(seq);
      if (!issue) continue;

      const unsubscribeUrl = getUnsubscribeUrl(sub.email);
      const result = await sendDripIssue(sub.email, issue, unsubscribeUrl);

      if (!result.sent) {
        errors += 1;
        errorDetails.push({
          email: sub.email,
          seq,
          message: result.reason ?? "unknown",
        });
        break;
      }

      await prisma.waitlistSend.create({
        data: { signupId: sub.id, sequenceNumber: seq },
      });
      sent += 1;
    }
  }

  return { subscribers: subscribers.length, sent, errors, errorDetails };
}
