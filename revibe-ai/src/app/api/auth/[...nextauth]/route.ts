import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

function readScopedAuthEnv(baseKey: "GITHUB_ID" | "GITHUB_SECRET"): string {
  const isProd = process.env.NODE_ENV === "production";
  const scopedKey = isProd ? `${baseKey}_PROD` : `${baseKey}_LOCAL`;
  const scopedValue = process.env[scopedKey];
  const fallbackValue = process.env[baseKey];
  const value = scopedValue || fallbackValue;

  if (!value) {
    throw new Error(`Missing required auth env: ${scopedKey} (or ${baseKey}).`);
  }

  return value;
}

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: readScopedAuthEnv("GITHUB_ID"),
      clientSecret: readScopedAuthEnv("GITHUB_SECRET"),
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/profile",
    error: "/profile",
  },
});

export { handler as GET, handler as POST };
