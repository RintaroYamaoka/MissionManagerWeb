"use client";

import { useState, useEffect } from "react";
import { countIncompleteMissions } from "@/lib/types";
import { Modal } from "./Modal";
import { EditTextModal } from "./EditTextModal";
import { ContextMenu } from "./ContextMenu";
import type { Genre } from "@/lib/types";

interface GenreSelectorProps {
  genres: Genre[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  selectedGenre?: Genre | null;
  onSelect?: (genre: Genre | null) => void;
}

export function GenreSelector({
  genres,
  loading,
  error,
  refetch,
  selectedGenre,
  onSelect,
}: GenreSelectorProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSummary, setAddSummary] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  useEffect(() => {
    if (!loading && !selectedGenre && genres.length > 0) {
      onSelect?.(genres[0]);
    }
  }, [loading, selectedGenre, genres, onSelect]);

  const handleAdd = async () => {
    const name = addName.trim();
    if (!name) {
      alert("名前を入力してください。");
      return;
    }
    try {
      const res = await fetch("/api/genres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, summary: addSummary.trim() || null }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "追加に失敗しました");
      }
      setAddName("");
      setAddSummary("");
      setShowAddModal(false);
      const data = await res.json();
      await refetch();
      onSelect?.(data.genre);
    } catch (e) {
      alert(e instanceof Error ? e.message : "不明なエラー");
    }
  };

  const apiCall = async (
    method: string,
    url: string,
    body?: object
  ): Promise<boolean> => {
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        credentials: "same-origin",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "操作に失敗しました");
      }
      await refetch();
      return true;
    } catch (e) {
      alert(e instanceof Error ? e.message : "不明なエラー");
      return false;
    }
  };

  const handleRename = () => {
    if (selectedGenre) setShowRenameModal(true);
  };

  const handleRenameConfirm = async (name: string) => {
    if (!selectedGenre) return;
    await apiCall("PATCH", `/api/genres/${selectedGenre.id}`, { name });
    setShowRenameModal(false);
  };

  const handleEditSummary = () => {
    if (selectedGenre) setShowSummaryModal(true);
  };

  const handleSummaryConfirm = async (summary: string) => {
    if (!selectedGenre) return;
    await apiCall("PATCH", `/api/genres/${selectedGenre.id}`, {
      summary: summary || null,
    });
    setShowSummaryModal(false);
  };

  const handleDelete = async () => {
    if (!selectedGenre) return;
    if (!window.confirm(`ジャンル「${selectedGenre.name}」を削除しますか？`)) return;
    await apiCall("DELETE", `/api/genres/${selectedGenre.id}`);
    const idx = genres.findIndex((g) => g.id === selectedGenre.id);
    const next = genres[idx + 1] ?? genres[idx - 1] ?? null;
    onSelect?.(next ?? null);
  };

  const handleMoveUp = async () => {
    if (!selectedGenre) return;
    await apiCall("POST", `/api/genres/${selectedGenre.id}/move/up`);
  };

  const handleMoveDown = async () => {
    if (!selectedGenre) return;
    await apiCall("POST", `/api/genres/${selectedGenre.id}/move/down`);
  };

  const contextMenuItems = selectedGenre
    ? [
        { label: "名前変更", onClick: handleRename },
        { label: "概要を編集", onClick: handleEditSummary },
        { label: "上へ移動", onClick: handleMoveUp },
        { label: "下へ移動", onClick: handleMoveDown },
        { label: "削除", onClick: handleDelete },
      ]
    : [];

  if (loading) return <p className="text-gray-400">読み込み中...</p>;
  if (error) return <p className="text-red-400">エラー: {error}</p>;

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div
        className="flex gap-2 items-center"
        onContextMenu={(e) => {
          if (selectedGenre) {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY });
          }
        }}
      >
        <select
          className="border border-gray-600 rounded px-3 py-2 flex-1 bg-gray-800 text-gray-100"
          value={selectedGenre?.id ?? ""}
          onChange={(e) => {
            const id = e.target.value;
            if (!id) {
              onSelect?.(null);
              return;
            }
            const g = genres.find((x) => x.id === id) ?? null;
            onSelect?.(g);
          }}
        >
          <option value="">ジャンルを選択</option>
          {genres.map((g) => {
            const n = countIncompleteMissions(g);
            const label = n > 0 ? `${g.name} · ${n}` : g.name;
            return (
              <option key={g.id} value={g.id}>
                {label}
              </option>
            );
          })}
        </select>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          追加
        </button>
      </div>
      {selectedGenre?.summary && (
        <p className="text-gray-400 text-sm">
          {selectedGenre.summary}
        </p>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="ジャンル追加"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">名前:</label>
            <input
              type="text"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="例: 開発"
              className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-800 text-gray-100 placeholder-gray-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">概要:</label>
            <textarea
              value={addSummary}
              onChange={(e) => setAddSummary(e.target.value)}
              placeholder="任意の概要・説明を入力"
              className="w-full border border-gray-600 rounded px-3 py-2 h-20 resize-none bg-gray-800 text-gray-100 placeholder-gray-500"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 text-gray-200"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}

      <EditTextModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        title="ジャンル名変更"
        initialValue={selectedGenre?.name ?? ""}
        placeholder="新しいジャンル名"
        onConfirm={handleRenameConfirm}
      />
      <EditTextModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        title="概要を編集"
        initialValue={selectedGenre?.summary ?? ""}
        placeholder="概要を入力"
        multiline
        allowEmpty
        onConfirm={handleSummaryConfirm}
      />
    </div>
  );
}
