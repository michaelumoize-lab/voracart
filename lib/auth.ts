import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { admin } from "better-auth/plugins";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !BETTER_AUTH_SECRET) {
  throw new Error(
    "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and BETTER_AUTH_SECRET environment variables are required",
  );
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [admin()],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [
    "http://localhost:3000",           // Local development
    "http://localhost:3001",           // Alternative local port
    "https://voracart.vercel.app",     // Your production URL
    "https://voracart-git-main.vercel.app", // Preview deployments (if needed)
    "https://voracart-*.vercel.app",   // ✅ Wildcard for all preview deploys
  ],

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: "buyer",
            },
          };
        },
      },
    },
  },


  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["buyer", "seller", "admin"], 
        required: false, 
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
