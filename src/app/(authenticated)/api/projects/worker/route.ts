import { getAuthenticatedUser, getUserWallets } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { ApiReturnType } from "@/types/api";
import { NextResponse } from "next/server";

export type WorkerProjectsApiResponse = Exclude<
  ApiReturnType<typeof GET>,
  { error: string }
>;

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

  const workerProjects = await supabase
    .from("projects")
    .select("*")
    .in("worker", wallets);

  if (workerProjects.error) {
    console.error("Database error:", workerProjects.error);
    return NextResponse.json(
      {
        error: "Failed to fetch worker projects",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    projects: workerProjects.data,
  });
}