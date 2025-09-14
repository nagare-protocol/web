import { getAuthenticatedUser, getUserWallets } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const privyUser = await getAuthenticatedUser();
  if (!privyUser) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const wallets = (await getUserWallets(privyUser)).map((w) =>
    w.address.toLowerCase()
  );

  const allocatedFunds = await supabase
    .from("projects")
    .select("size.sum()")
    .in("owner", wallets);

  if (allocatedFunds.error) {
    console.error("Database error:", allocatedFunds.error);
    return NextResponse.json(
      {
        error: "Failed to fetch allocated funds",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    allocated_funds: allocatedFunds.data?.[0].sum || 0,
  });
}
