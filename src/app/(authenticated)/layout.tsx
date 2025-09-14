import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { BreadcrumbWrapper } from "@/components/BreadcrumbWrapper";
import { getAuthenticatedUser } from "@/lib/privy";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if ((await getAuthenticatedUser()) === null) {
    redirect("/");
  }

  return (
    <BreadcrumbWrapper>
      <div className="h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </BreadcrumbWrapper>
  );
}
