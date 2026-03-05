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
