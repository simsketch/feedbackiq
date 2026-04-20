"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const APP_ORIGIN = "https://app.feedbackiq.app";
const DASHBOARD_URL = `${APP_ORIGIN}/dashboard`;

function useRemoteAuth() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${APP_ORIGIN}/api/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        setSignedIn(data?.signedIn === true);
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return signedIn;
}

export function MarketingNav() {
  const signedIn = useRemoteAuth();

  if (signedIn) {
    return (
      <a
        href={DASHBOARD_URL}
        className="text-sm bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
      >
        Dashboard
      </a>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="text-sm text-gray-600 hover:text-black"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="text-sm bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
      >
        Get Started
      </Link>
    </>
  );
}

interface CtaProps {
  signedOutLabel: string;
  signedOutHref: string;
  signedInLabel: string;
  className: string;
}

export function MarketingCta({
  signedOutLabel,
  signedOutHref,
  signedInLabel,
  className,
}: CtaProps) {
  const signedIn = useRemoteAuth();

  if (signedIn) {
    return (
      <a href={DASHBOARD_URL} className={className}>
        {signedInLabel}
      </a>
    );
  }

  return (
    <Link href={signedOutHref} className={className}>
      {signedOutLabel}
    </Link>
  );
}
