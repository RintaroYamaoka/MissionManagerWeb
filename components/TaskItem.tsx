"use client";

import { useState } from "react";
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
  onChanged?: () => void;
}

export function TaskItem({ task, missionId, onChanged }: TaskItemProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDueModal, setShowDueModal] = useState(false);

  const handleToggle = async () => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !task.done }),
        credentials: "same-origin",
      });
      if (res.ok) onChanged?.();
    } catch {
      // ignore
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
      className="flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-2 py-3 px-3 sm:py-1.5 sm:px-2 rounded hover:bg-gray-700/50 active:bg-gray-700/70 min-h-[44px] touch-manipulation"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      <input
        type="checkbox"
        checked={task.done}
        onChange={handleToggle}
        className="rounded cursor-pointer w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-0"
      />
      <span
        className={`flex-1 min-w-0 break-words ${task.done ? "line-through text-gray-500" : "text-gray-200"}`}
      >
        {task.name}
      </span>
      <div className="flex flex-wrap gap-x-3 gap-y-1 w-full sm:w-auto sm:flex-shrink-0 text-xs">
        {task.dueDate && (
          <span className="text-blue-400 font-medium">
            期限: {formatDateJp(task.dueDate)}
          </span>
        )}
        {task.completedAt && (
          <span className="text-emerald-400 font-medium">
            完了: {formatDateJp(task.completedAt)}
          </span>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            { label: "名前変更", onClick: handleRename },
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
