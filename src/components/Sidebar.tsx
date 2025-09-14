"use client";

import { useState } from "react";
import { LogoIcon } from "./LogoIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsFolder, BsWallet } from "react-icons/bs";

type Role = "Payer" | "Worker" | "LP";

const roleNavigation = {
  Payer: [
    { name: "Projects", href: "/payer/projects", icon: BsFolder },
    { name: "Payroll Vault", href: "/payer/payroll-vault", icon: BsWallet },
  ],
  Worker: [{ name: "Projects", href: "/worker/projects", icon: BsFolder }],
  LP: [],
};

export function Sidebar() {
  const pathname = usePathname();

  const getInitialRole = (): Role => {
    if (pathname.startsWith("/payer")) return "Payer";
    if (pathname.startsWith("/worker")) return "Worker";
    return "Payer";
  };

  const [selectedRole, setSelectedRole] = useState<Role>(getInitialRole());

  const navigationItems = roleNavigation[selectedRole];

  return (
    <div
      className="w-64 h-full border-r border-gray-200 flex flex-col"
      style={{ backgroundColor: "#F8FAFC" }}
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <LogoIcon className="size-8" />
          <div>
            <h2 className="font-bold text-lg">NAGARE</h2>
            <p className="text-sm text-gray-600">Protocol</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as Role)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="Payer">Payer</option>
          <option value="Worker">Worker</option>
          <option value="LP" disabled>
            LP (Coming soon)
          </option>
        </select>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                style={
                  isActive
                    ? { backgroundColor: "#E6EEF8", color: "#2563EB" }
                    : {}
                }
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
