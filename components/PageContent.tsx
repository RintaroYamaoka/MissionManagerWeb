"use client";

import { useState } from "react";
import { GenreSelector } from "./GenreSelector";
import { MissionList } from "./MissionList";
import { useGenres } from "@/hooks/useGenres";
import type { Genre } from "@/lib/types";

export function PageContent() {
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
  const { genres, loading, error, refetch, refetchSilent, updateTaskOptimistic } = useGenres();
  const selectedGenre = selectedGenreId
    ? genres.find((g) => g.id === selectedGenreId) ?? null
    : null;

  return (
    <div className="flex flex-col min-h-0 flex-1 pb-4" style={{ minHeight: "calc(100dvh - 140px)" }}>
      <GenreSelector
        genres={genres}
        loading={loading}
        error={error}
        refetch={refetch}
        refetchSilent={refetchSilent}
        selectedGenre={selectedGenre}
        onSelect={(g) => setSelectedGenreId(g?.id ?? null)}
      />
      <MissionList
        selectedGenre={selectedGenre}
        refetch={refetch}
        refetchSilent={refetchSilent}
        updateTaskOptimistic={updateTaskOptimistic}
      />
    </div>
  );
}
