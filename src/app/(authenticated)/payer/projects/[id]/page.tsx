"use client";

import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { TablesInsert } from "@/types/supabase";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAddress } from "viem";

interface Milestone {
  title: string;
  text: string;
  size: number | null;
}

type Project = TablesInsert<"projects">;
interface ProjectApiResponse {
  project: Project;
}

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumb();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    catagory: "",
    size: "",
    fid: "",
    worker: "",
  });
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const isReadOnly = project?.agreement_id !== null;

  useEffect(() => {
    setBreadcrumbs([
      { text: "Projects", path: "/payer/projects" },
      { text: project?.title || "Project Details" },
    ]);
  }, [setBreadcrumbs, project?.title]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (response.ok) {
          const data: ProjectApiResponse = await response.json();
          setProject(data.project);
          const additionalInfo = data.project.additional_information as Record<
            string,
            unknown
          >;
          setFormData({
            title: data.project.title || "",
            description: data.project.description || "",
            start_date: data.project.start_date || "",
            end_date: data.project.end_date || "",
            catagory: data.project.catagory || "",
            size: data.project.size?.toString() || "",
            fid: additionalInfo?.fid?.toString() || "",
            worker: data.project.worker || "",
          });
          setMilestones((additionalInfo?.milestones as Milestone[]) || []);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMilestoneChange = (
    index: number,
    field: keyof Milestone,
    value: string
  ) => {
    setMilestones((prev) =>
      prev.map((milestone, i) =>
        i === index
          ? {
              ...milestone,
              [field]:
                field === "size" ? (value ? Number(value) : null) : value,
            }
          : milestone
      )
    );
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      title: "",
      text: "",
      size: null,
    };
    setMilestones((prev) => [...prev, newMilestone]);
  };

  const removeMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMilestonePercentageChange = (
    index: number,
    percentage: string
  ) => {
    const projectSize = Number(formData.size) || 0;
    const newSize = projectSize
      ? (projectSize * Number(percentage)) / 100
      : null;

    setMilestones((prev) =>
      prev.map((milestone, i) =>
        i === index ? { ...milestone, size: newSize } : milestone
      )
    );
  };

  const getMilestonePercentage = (milestoneSize: number | null): string => {
    const projectSize = Number(formData.size) || 0;
    if (!projectSize || !milestoneSize) return "";
    return ((milestoneSize / projectSize) * 100).toFixed(2);
  };

  const getTotalMilestoneSize = (): number => {
    return milestones.reduce(
      (sum, milestone) => sum + (milestone.size || 0),
      0
    );
  };

  const isValidMilestoneSum = (): boolean => {
    const projectSize = Number(formData.size) || 0;
    const totalMilestoneSize = getTotalMilestoneSize();
    return Math.abs(totalMilestoneSize - projectSize) < 0.01; // Allow small floating point differences
  };

  const isValidWorkerAddress = (): boolean => {
    return !formData.worker || isAddress(formData.worker);
  };

  const canStart = (): boolean => {
    return (
      isValidMilestoneSum() && isValidWorkerAddress() && formData.worker !== ""
    );
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        fid: formData.fid ? Number(formData.fid) : null,
        size: formData.size ? Number(formData.size) : null,
        milestones,
      };

      const response = await fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      } else {
        console.error("Failed to save project");
      }
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Project not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isReadOnly && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                This project has an active agreement and cannot be modified.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Project Details Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Project Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="catagory"
              value={formData.catagory}
              onChange={handleInputChange}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select category</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Farcaster FID
            </label>
            <input
              type="number"
              name="fid"
              value={formData.fid}
              onChange={handleInputChange}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter FID"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Worker Address
            </label>
            <input
              type="text"
              name="worker"
              value={formData.worker}
              onChange={handleInputChange}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                isValidWorkerAddress()
                  ? "border-gray-300 focus:ring-blue-500"
                  : "border-red-300 focus:ring-red-500"
              }`}
              placeholder="0x..."
            />
            {!isValidWorkerAddress() && (
              <p className="mt-1 text-sm text-red-600">
                Please enter a valid Ethereum address
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isReadOnly}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Budget Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Budget</h2>
          <div className="text-right">
            <div className="text-lg font-semibold text-green-600">APY 4.8%</div>
            <div className="text-xs text-gray-500 max-w-48">
              Yield from Morpho Blue on unallocated funds
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Size (USDC)
          </label>
          <input
            type="number"
            name="size"
            value={formData.size}
            onChange={handleInputChange}
            disabled={isReadOnly}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      {/* Milestones Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Milestones</h2>
          {!isReadOnly && (
            <button
              onClick={addMilestone}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Milestone
            </button>
          )}
        </div>

        {milestones && milestones.length > 0 ? (
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div
                key={`milestone-${index}`}
                className="border border-gray-200 rounded-md p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Milestone {index + 1} Title
                    </label>
                    <input
                      type="text"
                      value={milestone.title || ""}
                      onChange={(e) =>
                        handleMilestoneChange(index, "title", e.target.value)
                      }
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="ml-4 w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (USDC) / %
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={milestone.size || ""}
                        onChange={(e) =>
                          handleMilestoneChange(index, "size", e.target.value)
                        }
                        disabled={isReadOnly}
                        className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                      <input
                        type="number"
                        value={getMilestonePercentage(milestone.size)}
                        onChange={(e) =>
                          handleMilestonePercentageChange(index, e.target.value)
                        }
                        disabled={isReadOnly}
                        className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                        placeholder="0"
                        step="0.01"
                        min="0"
                        max="100"
                      />
                      <span className="text-gray-500 text-sm self-center">
                        %
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text
                  </label>
                  <textarea
                    value={milestone.text || ""}
                    onChange={(e) =>
                      handleMilestoneChange(index, "text", e.target.value)
                    }
                    disabled={isReadOnly}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                {!isReadOnly && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => removeMilestone(index)}
                      className="px-3 py-1 text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No milestones defined yet.
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isReadOnly && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 cursor-pointer text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={() =>
              handleSave().then(() => router.push("/payer/projects"))
            }
            className="px-4 py-2 cursor-pointer border border-blue-600 text-gray-700 bg-blue-600/10 rounded-md hover:bg-blue-600/30 transition-colors"
          >
            Save
          </button>
          <button
            disabled={!canStart()}
            className={`px-4 py-2 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed ${
              canStart()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Start
          </button>
        </div>
      )}
    </div>
  );
}
