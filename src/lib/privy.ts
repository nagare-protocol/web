import "server-only";

import { PrivyClient, User } from "@privy-io/server-auth";
import { cookies } from "next/headers";

export const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("privy-id-token")?.value;

    if (!accessToken) {
      return null;
    }

    const verifiedClaims = await privyClient.verifyAuthToken(accessToken);
    if (!verifiedClaims) {
      return null;
    }

    return await privyClient.getUser({ idToken: accessToken });
  } catch (error) {
    console.error("Auth verification failed:", error);
    return null;
  }
}

export async function getUserWallets(user: User) {
  const wallets = user.linkedAccounts.filter((e) => e.type === "wallet");
  return wallets;
}
