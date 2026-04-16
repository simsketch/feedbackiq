import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getAuthUser } from "@/lib/auth";
import DashboardNav from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await getAuthUser();
  if (!user) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-[#09090b] relative">
      <div className="radial-glow" />
      <DashboardNav />
      <main className="relative grid-bg max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
