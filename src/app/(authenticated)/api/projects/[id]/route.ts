import { getAuthenticatedUser, getUserWallets } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { ApiReturnType } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";

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
    .select("*, completed_checkpoints(checkpoint_id)")
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

export async function PATCH(
  request: NextRequest,
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

  const projectId = Number((await params).id);
  const updateData = await request.json();

  // Verify user owns the project
  const { data: existingProject, error: fetchError } = await supabase
    .from("projects")
    .select("owner, agreement_id")
    .eq("id", projectId)
    .single();

  if (fetchError || !existingProject) {
    return NextResponse.json(
      {
        error: "Project not found",
      },
      { status: 404 }
    );
  }

  if (!wallets.includes(existingProject.owner.toLowerCase())) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 403 }
    );
  }

  if (existingProject.agreement_id) {
    return NextResponse.json(
      {
        error: "Cannot modify project with active agreement",
      },
      { status: 400 }
    );
  }

  // Prepare update data
  const { fid, milestones, worker, start_date, end_date, ...projectFields } =
    updateData;
  const additionalInfo = { fid, milestones };

  if (worker && typeof worker === "string" && !isAddress(worker)) {
    return NextResponse.json(
      {
        error: "Invalid worker address",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .update({
      ...projectFields,
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
      worker: worker.toLowerCase(),
      additional_information: additionalInfo,
    })
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error: "Failed to update project",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ project: data });
}
