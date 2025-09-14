"use client";

import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { TablesInsert } from "@/types/supabase";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ProjectGetApiResponse } from "@/app/(authenticated)/api/projects/[id]/route";

interface Milestone {
  title: string;
  text: string;
  size: number | null;
  verified: boolean;
}

type Project = TablesInsert<"projects">;

// Mock client data for display
const mockClient = {
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  name: "John Smith",
  company: "Smith Design Studio",
  location: "New York, USA",
  rating: 4.8,
  reviewCount: 24,
  completedProjects: 12,
  memberSince: "March 2022",
  responseTime: "Within 2 hours",
  languages: ["English", "Spanish"],
  skills: ["UI/UX Design", "Web Development", "Brand Design"],
  description:
    "Professional designer with 5+ years of experience, specializing in modern web design and user experience optimization.",
};

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    console.log("Copied to clipboard");
  });
}

export default function Page() {
  const params = useParams();
  const { setBreadcrumbs } = useBreadcrumb();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<
    number | null
  >(null);
  const [verificationHash, setVerificationHash] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    setBreadcrumbs([
      { text: "Projects", path: "/worker/projects" },
      { text: project?.title || "Project Details" },
    ]);
  }, [setBreadcrumbs, project?.title]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (response.ok) {
          const data: ProjectGetApiResponse = await response.json();
          setProject(data.project);
          const additionalInfo = data.project.additional_information as Record<
            string,
            unknown
          >;
          const milestonesData =
            (additionalInfo?.milestones as Milestone[]) || [];
          const completedCheckpoints = data.project.completed_checkpoints.map(
            (e) => e.checkpoint_id
          );

          // Mark milestones as verified if they are in completed_checkpoints
          const updatedMilestones = milestonesData.map((milestone, index) => ({
            ...milestone,
            verified: completedCheckpoints.includes(index),
          }));

          setMilestones(updatedMilestones);
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

  const handleVerifyClick = (index: number) => {
    setSelectedMilestoneIndex(index);
    setShowVerifyDialog(true);
  };

  const handleVerifySubmit = async () => {
    if (selectedMilestoneIndex !== null && verificationHash.trim()) {
      setVerifyError(null); // Clear any previous errors

      try {
        // Send PUT request to verify checkpoint
        const response = await fetch(`/api/projects/${params.id}/checkpoints`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkpoint_id: selectedMilestoneIndex,
          }),
        });

        if (response.ok) {
          // Update milestone status locally
          setMilestones((prev) =>
            prev.map((milestone, i) =>
              i === selectedMilestoneIndex
                ? { ...milestone, verified: true }
                : milestone
            )
          );

          // Close dialog and reset form
          setShowVerifyDialog(false);
          setSelectedMilestoneIndex(null);
          setVerificationHash("");
        } else {
          const errorData = await response.json();
          setVerifyError(errorData.message || "Failed to verify checkpoint");
        }
      } catch (error) {
        setVerifyError("Network error occurred while verifying checkpoint");
        console.error("Error verifying checkpoint:", error);
      }
    }
  };

  const handleVerifyCancel = () => {
    setShowVerifyDialog(false);
    setSelectedMilestoneIndex(null);
    setVerificationHash("");
    setVerifyError(null);
  };

  const getProjectStatus = () => {
    if (!project) return { status: "unknown", label: "Unknown", color: "gray" };

    // If no agreement_id, it's still in draft
    if (!project.agreement_id) {
      return { status: "draft", label: "Draft", color: "gray" };
    }

    // If has agreement_id, check dates
    const now = new Date();
    const startDate = project.start_date ? new Date(project.start_date) : null;
    const endDate = project.end_date ? new Date(project.end_date) : null;

    if (startDate && now < startDate) {
      return { status: "not_started", label: "Not Started", color: "blue" };
    } else if (endDate && now > endDate) {
      return { status: "completed", label: "Completed", color: "green" };
    } else {
      return { status: "in_progress", label: "In Progress", color: "yellow" };
    }
  };

  const projectStatus = getProjectStatus();

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Client Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 sticky top-6">
            <div className="text-center mb-6">
              <Image
                src={mockClient.avatar}
                alt="Client Avatar"
                width={80}
                height={80}
                className="rounded-full mx-auto mb-4 object-cover"
              />
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {mockClient.name}
              </h2>
              <p className="text-gray-600 mb-2">{mockClient.company}</p>
              <div className="flex items-center justify-center text-yellow-500 mb-2">
                <span className="text-lg">⭐</span>
                <span className="ml-1 text-gray-700 font-medium">
                  {mockClient.rating}
                </span>
                <span className="ml-1 text-gray-500 text-sm">
                  ({mockClient.reviewCount} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Location:</span>
                <span className="text-gray-600">{mockClient.location}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Completed Projects:
                </span>
                <span className="text-gray-600">
                  {mockClient.completedProjects}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Member Since:</span>
                <span className="text-gray-600">{mockClient.memberSince}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Response Time:
                </span>
                <span className="text-gray-600">{mockClient.responseTime}</span>
              </div>

              <div>
                <span className="font-medium text-gray-700 block mb-2">
                  Languages:
                </span>
                <div className="flex flex-wrap gap-1">
                  {mockClient.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700 block mb-2">
                  Skills:
                </span>
                <div className="flex flex-wrap gap-1">
                  {mockClient.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <span className="font-medium text-gray-700 block mb-2">
                  Project Status:
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      projectStatus.color === "gray"
                        ? "bg-gray-100 text-gray-800"
                        : projectStatus.color === "blue"
                        ? "bg-blue-100 text-blue-800"
                        : projectStatus.color === "yellow"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {projectStatus.label}
                  </span>
                </div>
                {project.agreement_id && (
                  <div className="mt-2 text-xs text-gray-500">
                    Contract ID: {project.agreement_id}
                  </div>
                )}
              </div>

              <div>
                <span className="font-medium text-gray-700 block mb-2">
                  Bio:
                </span>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {mockClient.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Project Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details Section */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {project.title}
              </h1>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  projectStatus.color === "gray"
                    ? "bg-gray-100 text-gray-800"
                    : projectStatus.color === "blue"
                    ? "bg-blue-100 text-blue-800"
                    : projectStatus.color === "yellow"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {projectStatus.label}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <span className="font-medium text-gray-700">Category:</span>
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {project.catagory}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Project Period:
                </span>
                <span className="ml-2 text-gray-600">
                  {project.start_date} ~ {project.end_date}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-3">
                Project Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Status Information */}
            {projectStatus.status === "draft" && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-800">
                      This project is still in draft mode. It will become active
                      once the contract is created.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {projectStatus.status === "not_started" && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      Project is scheduled to start on {project.start_date}. Get
                      ready!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {projectStatus.status === "in_progress" && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      Project is currently in progress. Work on your milestones
                      below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {projectStatus.status === "completed" && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">
                      Project has been completed! Great job on finishing all
                      milestones.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Milestones Section */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Project Milestones
            </h2>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-6 transition-all ${
                    milestone.verified
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {milestone.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        ${milestone.size?.toLocaleString()} USDC
                      </span>
                      {milestone.verified && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-start justify-between">
                      <p className="text-gray-600 leading-relaxed flex-1 mr-4">
                        {milestone.text}
                      </p>
                      <button
                        onClick={() => copyToClipboard(milestone.text)}
                        className="flex-shrink-0 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border transition-colors"
                        title="Copy content"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleVerifyClick(index)}
                      disabled={milestone.verified}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        milestone.verified
                          ? "bg-green-100 text-green-800 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {milestone.verified ? "Verified Complete" : "Verify"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Dialog */}
      {showVerifyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Verify Milestone Completion
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a verification hash to confirm the completion of
              this milestone.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Hash
              </label>
              <input
                type="text"
                value={verificationHash}
                onChange={(e) => setVerificationHash(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter verification hash..."
                autoFocus
              />
            </div>
            {verifyError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{verifyError}</p>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleVerifyCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifySubmit}
                disabled={!verificationHash.trim()}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  verificationHash.trim()
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
