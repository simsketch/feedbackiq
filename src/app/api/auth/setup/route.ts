import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existingUser) {
    return NextResponse.json({ error: "Already set up" }, { status: 409 });
  }

  const { companyName } = await request.json();
  if (!companyName) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const company = await prisma.company.create({
    data: {
      name: companyName,
      users: {
        create: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
          role: "owner",
        },
      },
    },
    include: { users: true },
  });

  return NextResponse.json({ id: company.users[0].id }, { status: 201 });
}
