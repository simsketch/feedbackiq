import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
      <SignUp forceRedirectUrl="/onboarding" />
    </div>
  );
}
