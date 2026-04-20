import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export async function NavAuthLinks() {
  const { userId } = await auth();

  if (userId) {
    return (
      <Link
        href="/dashboard"
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-zinc-200"
      >
        Dashboard
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="text-sm text-zinc-400 transition-colors hover:text-white"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-zinc-200"
      >
        Get started
      </Link>
    </>
  );
}

interface CtaProps {
  signedOutLabel: string;
  signedInLabel: string;
  className: string;
  children?: React.ReactNode;
}

export async function AuthAwareCta({
  signedOutLabel,
  signedInLabel,
  className,
  children,
}: CtaProps) {
  const { userId } = await auth();
  const href = userId ? "/dashboard" : "/signup";
  const label = userId ? signedInLabel : signedOutLabel;
  return (
    <Link href={href} className={className}>
      {label}
      {children}
    </Link>
  );
}
