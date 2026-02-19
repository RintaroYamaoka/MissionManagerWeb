"use client";

import { useState, useEffect } from "react";
import { formatDateJp } from "@/lib/types";
import { EditTextModal } from "./EditTextModal";
import { EditDateModal } from "./EditDateModal";
import { ContextMenu } from "./ContextMenu";
import type { Task } from "@/lib/types";

function toDateInputValue(v: string | null | undefined): string {
  if (!v) return "";
  const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

interface TaskItemProps {
  task: Task;
  missionId: string;
  genreId?: string;
  onChanged?: () => void;
  updateTaskOptimistic?: (genreId: string, missionId: string, taskId: string, done: boolean, completedAt: string | null) => void;
}

export function TaskItem({ task, missionId, genreId, onChanged, updateTaskOptimistic }: TaskItemProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showDueModal, setShowDueModal] = useState(false);
  const [optimisticDone, setOptimisticDone] = useState<boolean | null>(null);

  const displayedDone = optimisticDone ?? task.done;
  useEffect(() => {
    if (optimisticDone !== null && task.done === optimisticDone) {
      setOptimisticDone(null);
    }
  }, [optimisticDone, task.done]);
  const displayedCompletedAt = displayedDone ? (task.completedAt || new Date().toISOString().slice(0, 10)) : null;

  const handleToggle = async () => {
    const nextDone = !displayedDone;
    const completedAt = nextDone ? new Date().toISOString().slice(0, 10) : null;

    if (genreId && updateTaskOptimistic) {
      updateTaskOptimistic(genreId, missionId, task.id, nextDone, completedAt);
    }
    setOptimisticDone(nextDone);

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: nextDone }),
        credentials: "same-origin",
      });
      if (res.ok) {
        onChanged?.();
      } else {
        setOptimisticDone(task.done);
        if (genreId && updateTaskOptimistic) {
          updateTaskOptimistic(genreId, missionId, task.id, task.done, task.completedAt);
        }
      }
    } catch {
      setOptimisticDone(task.done);
      if (genreId && updateTaskOptimistic) {
        updateTaskOptimistic(genreId, missionId, task.id, task.done, task.completedAt);
      }
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
      onChanged?.();
      return true;
    } catch (e) {
      alert(e instanceof Error ? e.message : "不明なエラー");
      return false;
    }
  };

  const handleRename = () => setShowRenameModal(true);
  const handleRenameConfirm = async (name: string) => {
    await apiCall("PATCH", `/api/tasks/${task.id}`, { name });
    setShowRenameModal(false);
  };

  const handleEditSummary = () => setShowSummaryModal(true);
  const handleSummaryConfirm = async (summary: string) => {
    await apiCall("PATCH", `/api/tasks/${task.id}`, { summary: summary || null });
    setShowSummaryModal(false);
  };

  const handleEditDue = () => setShowDueModal(true);
  const handleDueConfirm = async (due: string | null) => {
    await apiCall("PATCH", `/api/tasks/${task.id}`, { due_date: due });
    setShowDueModal(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`タスク「${task.name}」を削除しますか？`)) return;
    await apiCall("DELETE", `/api/tasks/${task.id}`);
  };

  const handleMoveUp = () => apiCall("POST", `/api/tasks/${task.id}/move/up`);
  const handleMoveDown = () => apiCall("POST", `/api/tasks/${task.id}/move/down`);

  return (
    <div
      className="flex gap-2 py-3 px-3 sm:py-1.5 sm:px-2 rounded hover:bg-gray-700/50 active:bg-gray-700/70 min-h-[44px] touch-manipulation"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      <input
        type="checkbox"
        checked={displayedDone}
        onChange={handleToggle}
        className="rounded cursor-pointer w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-0"
      />
      <div className="flex-1 min-w-0">
        <div
          className={`break-words ${displayedDone ? "line-through text-gray-500" : "text-gray-200"}`}
        >
          {task.name}
        </div>
        {(task.summary || task.dueDate || displayedCompletedAt) && (
          <div className="mt-1 text-xs space-y-0.5">
            {task.summary && (
              <p className="text-gray-400">{task.summary}</p>
            )}
            {(task.dueDate || displayedCompletedAt) && (
              <div className="flex flex-wrap sm:flex-nowrap gap-x-3 gap-y-0.5">
            {task.dueDate && (
              <span className="text-blue-400 font-medium whitespace-nowrap">
                期限: {formatDateJp(task.dueDate)}
              </span>
            )}
            {displayedCompletedAt && (
              <span className="text-emerald-400 font-medium whitespace-nowrap">
                完了: {formatDateJp(displayedCompletedAt)}
              </span>
            )}
              </div>
            )}
          </div>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            { label: "名前変更", onClick: handleRename },
            { label: "概要を編集", onClick: handleEditSummary },
            { label: "期限を編集", onClick: handleEditDue },
            { label: "上へ移動", onClick: handleMoveUp },
            { label: "下へ移動", onClick: handleMoveDown },
            { label: "削除", onClick: handleDelete },
          ]}
          onClose={() => setContextMenu(null)}
        />
      )}

      <EditTextModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        title="タスク名変更"
        initialValue={task.name}
        placeholder="タスク名"
        onConfirm={handleRenameConfirm}
      />
      <EditTextModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        title="概要を編集"
        initialValue={task.summary ?? ""}
        placeholder="概要を入力"
        multiline
        allowEmpty
        onConfirm={handleSummaryConfirm}
      />
      <EditDateModal
        isOpen={showDueModal}
        onClose={() => setShowDueModal(false)}
        title="期限を編集"
        initialValue={toDateInputValue(task.dueDate)}
        onConfirm={handleDueConfirm}
      />
    </div>
  );
}
