import { auth, clerkClient } from "@clerk/nextjs/server";

const DEFAULT_OWNER_EMAIL = "simsketch@gmail.com";

function getOwnerEmails(): string[] {
  const raw = process.env.OWNER_EMAIL || DEFAULT_OWNER_EMAIL;
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function isCurrentUserOwner(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email) return false;

  return getOwnerEmails().includes(email);
}
