"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WorkerProjectsApiResponse } from "../../api/projects/worker/route";

export default function Page() {
  const [projects, setProjects] = useState<WorkerProjectsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects/worker");
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  const formatAddress = (address: string | null) => {
    if (!address) return "Not assigned";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(28rem,1fr))] gap-6">
        {projects?.projects?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No projects assigned to you.
          </div>
        ) : (
          projects?.projects?.map((project) => (
            <Link
              key={project.id}
              href={`/worker/projects/${project.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  {project.title || "Untitled Project"}
                </h3>
                <span className="text-sm text-gray-500">
                  Size: {project.size || "TBD"}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {project.description || "No description available."}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Payer: {formatAddress(project.owner)}</span>
                <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
