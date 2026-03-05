import "next-auth";

declare module "next-auth" {
  interface User {
    companyId: string;
    role: string;
  }

  interface Session {
    user: User & {
      id: string;
      companyId: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    companyId: string;
    role: string;
  }
}
