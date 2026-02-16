"use client";

import { useState, useEffect, useCallback } from "react";
import type { PassPower } from "@/types";
import { calculatePassPower } from "@/lib/pass-power";

export function usePassPower() {
  const [passPower, setPassPower] = useState<PassPower | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const pp = await calculatePassPower();
      setPassPower(pp);
    } catch {
      // IndexedDB not available (SSR)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { passPower, loading, refresh };
}
