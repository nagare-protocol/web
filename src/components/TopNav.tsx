"use client";

import { useState, useRef, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { BsBell, BsChevronDown } from "react-icons/bs";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";

export function TopNav() {
  const router = useRouter();
  const { breadcrumbs } = useBreadcrumb();
  const { user, logout } = usePrivy();
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsAvatarDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const walletAddress = user?.wallet?.address;

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <span key={index} className="flex items-center">
            {index > 0 && <span className="text-gray-400 mx-2">/</span>}
            {crumb.path ? (
              <button
                onClick={() => router.push(crumb.path!)}
                className={`transition-colors hover:text-gray-700 cursor-pointer ${
                  index === breadcrumbs.length - 1
                    ? "text-gray-900 font-medium"
                    : "text-gray-500"
                }`}
              >
                {crumb.text}
              </button>
            ) : (
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? "text-gray-900 font-medium"
                    : "text-gray-500"
                }
              >
                {crumb.text}
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <BsBell className="h-5 w-5" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {walletAddress ? walletAddress.slice(2, 4).toUpperCase() : "U"}
              </span>
            </div>
            <BsChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {isAvatarDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50">
              <div className="py-1">
                {walletAddress && (
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Wallet Address</p>
                    <button
                      onClick={() => copyAddress(walletAddress)}
                      className="text-sm font-mono text-gray-900 hover:text-purple-600 transition-colors"
                    >
                      {formatAddress(walletAddress)}
                    </button>
                  </div>
                )}
                <button
                  onClick={() => logout().then(() => router.push("/"))}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
