"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ConnectButton() {
  const { ready, authenticated, user, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (authenticated && user) {
      router.push("/home");
    }
  }, [authenticated, user, router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  if (authenticated && user) {
    return (
      <div className="flex items-center justify-center p-4 bg-green-100 rounded-lg">
        <div className="animate-pulse text-green-800">
          Redirecting to home...
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02]"
    >
      Connect Wallet
    </button>
  );
}
