import "next-auth";

declare module "next-auth" {
  interface User {
    role: "admin" | "doctor";
    doctorId?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "admin" | "doctor";
      doctorId?: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    role: "admin" | "doctor";
    doctorId?: string;
  }
}