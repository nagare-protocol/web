import { getAuthenticatedUser, getUserWallets } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { ApiReturnType } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

export type ProjectGetApiResponse = Exclude<
  ApiReturnType<typeof GET>,
  { error: string }
>;

export async function GET(
  _: NextRequest,
  { params }: RouteContext<"/api/projects/[id]">
) {
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

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", Number((await params).id))
    .single();

  if (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch project",
      },
      { status: 500 }
    );
  }

  if (
    !data ||
    // check if the user is either the owner or the worker of the project
    (!wallets.includes(data.owner.toLowerCase()) &&
      data.worker &&
      !wallets.includes(data.worker.toLowerCase()))
  ) {
    return NextResponse.json(
      {
        error: "Project not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ project: data });
}
