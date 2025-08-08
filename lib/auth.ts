import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import { AdminModel, DoctorModel } from "./models";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        type: { label: "Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.type) {
          return null;
        }

        try {
          await connectToDatabase();

          if (credentials.type === "admin") {
            const admin = await AdminModel.findOne({ email: credentials.email });
            
            if (admin && await bcrypt.compare(credentials.password, admin.password)) {
              return {
                id: admin._id.toString(),
                email: admin.email,
                name: admin.name,
                role: "admin" as const,
              };
            }
          } else if (credentials.type === "doctor") {
            const doctor = await DoctorModel.findOne({ email: credentials.email });
            
            if (doctor && doctor.password && await bcrypt.compare(credentials.password, doctor.password)) {
              return {
                id: doctor._id.toString(),
                email: doctor.email,
                name: doctor.name,
                role: "doctor" as const,
                doctorId: doctor._id.toString(),
              };
            }
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.doctorId = user.doctorId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.doctorId = token.doctorId as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to appropriate dashboard after login
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};