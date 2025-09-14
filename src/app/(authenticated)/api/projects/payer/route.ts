import { getAuthenticatedUser, getUserWallets } from "@/lib/privy";
import { supabase } from "@/lib/supabase";
import { ApiReturnType } from "@/types/api";
import { NextResponse } from "next/server";

export type PayerProjectsApiResponse = Exclude<
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

  const payerProjects = await supabase
    .from("projects")
    .select("*")
    .in("owner", wallets);

  if (payerProjects.error) {
    console.error("Database error:", payerProjects.error);
    return NextResponse.json(
      {
        error: "Failed to fetch payer projects",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    projects: payerProjects.data,
  });
}

export type ProjectCreateApiResponse = Exclude<
  ApiReturnType<typeof POST>,
  { error: string }
>;

export async function POST() {
  const privyUser = await getAuthenticatedUser();
  if (!privyUser) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const defaultWallet = (await getUserWallets(privyUser))[0];

  const newProject = await supabase
    .from("projects")
    .insert({
      title: "New Project",
      description: "Project description",
      owner: defaultWallet.address.toLowerCase(),
    })
    .select()
    .single();

  if (newProject.error) {
    console.error("Database error:", newProject.error);
    return NextResponse.json(
      {
        error: "Failed to create project",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: newProject.data.id });
}
