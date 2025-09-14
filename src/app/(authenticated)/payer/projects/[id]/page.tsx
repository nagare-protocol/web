"use client";

import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { useEffect } from "react";

export default function Page() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([
      { text: "Projects", path: "/payer/projects" },
      { text: "Unnamed Project" },
    ]);
  }, [setBreadcrumbs]);
  return <></>;
}
