"use client";

import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import { ReactNode } from "react";

interface BreadcrumbWrapperProps {
  children: ReactNode;
}

export function BreadcrumbWrapper({ children }: BreadcrumbWrapperProps) {
  return <BreadcrumbProvider>{children}</BreadcrumbProvider>;
}