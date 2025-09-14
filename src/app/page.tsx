import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/privy";
import { ConnectButton } from "@/components/ConnectButton";
import { LogoIcon } from "@/components/LogoIcon";

export default async function Home() {
  // 檢查用戶是否已認證
  const user = await getAuthenticatedUser();

  // 如果已認證，重定向到 /home
  if (user) {
    redirect("/home");
  }

  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <div className="flex flex-col items-center gap-4">
        <LogoIcon className="size-16" />
        <h1 className="text-3xl font-bold">NAGARE Protocol</h1>
        <p className="text-gray-600 text-center max-w-md">
          Connect your wallet to get started with NAGARE Protocol
        </p>
      </div>

      <div className="w-full max-w-md">
        <ConnectButton />
      </div>
    </div>
  );
}
