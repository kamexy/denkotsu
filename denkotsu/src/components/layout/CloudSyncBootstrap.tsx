"use client";

import { useEffect } from "react";
import { runStartupCloudPull } from "@/lib/cloud-sync";

export function CloudSyncBootstrap() {
  useEffect(() => {
    void runStartupCloudPull();
  }, []);

  return null;
}
