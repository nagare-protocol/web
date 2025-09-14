import { PrivyClient } from "@privy-io/server-auth";
import { cookies } from "next/headers";

const privyApi = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("privy-token")?.value;

    if (!accessToken) {
      return null;
    }

    const verifiedClaims = await privyApi.verifyAuthToken(accessToken);
    return verifiedClaims;
  } catch (error) {
    console.error("Auth verification failed:", error);
    return null;
  }
}
