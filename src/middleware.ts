export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/api/projects/:path*", "/api/feedback/:path*", "/api/pull-requests/:path*", "/api/github/:path*"],
};
