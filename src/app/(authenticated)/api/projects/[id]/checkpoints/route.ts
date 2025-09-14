import { getAuthenticatedUser, getUserWallets } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: RouteContext<"/api/projects/[id]/checkpoints">
) {
  const checkpointId = (await request.json()).checkpoint_id;

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
    .select("worker")
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

  if (!data || !data.worker || !wallets.includes(data.worker.toLowerCase())) {
    return NextResponse.json(
      {
        error: "Forbidden",
      },
      { status: 403 }
    );
  }

  const { data: insertData, error: insertError } = await supabase
    .from("completed_checkpoints")
    .insert({
      project_id: Number((await params).id),
      checkpoint_id: checkpointId,
    });

  if (insertError) {
    console.error("Database error:", insertError);
    return NextResponse.json(
      {
        error: "Failed to insert completed checkpoint",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Checkpoint completed successfully",
      data: insertData,
    },
    { status: 200 }
  );
}
