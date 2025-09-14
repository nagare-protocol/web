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

  const payerProjects = await supabase
    .from("projects")
    .select("*")
    .in("owner", wallets);
  const workerProjects = await supabase
    .from("projects")
    .select("*")
    .in("worker", wallets);

  if (payerProjects.error || workerProjects.error) {
    console.error("Database error:", payerProjects.error, workerProjects.error);
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    payerProjects: payerProjects.data,
    workerProjects: workerProjects.data,
  });
}
