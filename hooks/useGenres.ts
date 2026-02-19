"use client";

import { useState, useEffect, useCallback } from "react";
import type { Genre, Mission } from "@/lib/types";

export function useGenres() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGenres = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/genres", { credentials: "same-origin" });
      if (!res.ok) throw new Error("取得に失敗しました");
      const data = await res.json();
      setGenres(data.genres ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "不明なエラー");
      setGenres([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  return { genres, loading, error, refetch: fetchGenres };
}
