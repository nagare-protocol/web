"use client";

import Link from "next/link";
import { BsCreditCard, BsPerson } from "react-icons/bs";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Choose Your Role
      </h1>
      <div className="flex gap-8">
        <Link
          href="/payer/projects"
          className="flex flex-col items-center justify-between p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 w-80 h-64"
        >
          <BsCreditCard className="h-16 w-16 text-blue-600" />
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payer</h2>
            <p className="text-gray-600 text-center text-sm">
              Manage projects and payroll
            </p>
          </div>
        </Link>

        <Link
          href="/worker/projects"
          className="flex flex-col items-center justify-between p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 w-80 h-64"
        >
          <BsPerson className="h-16 w-16 text-green-600" />
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Worker</h2>
            <p className="text-gray-600 text-center text-sm">
              View and manage assigned projects
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
