"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "./Modal";

interface EditDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialValue: string; // YYYY-MM-DD or ""
  onConfirm: (value: string | null) => void;
}

export function EditDateModal({
  isOpen,
  onClose,
  title,
  initialValue,
  onConfirm,
}: EditDateModalProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    onConfirm(trimmed && /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null);
    onClose();
  };

  const handleClear = () => {
    onConfirm(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 border border-gray-600 rounded px-3 py-2 bg-gray-800 text-gray-100"
          />
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 border border-gray-600 rounded hover:bg-gray-700 text-gray-200"
          >
            解除
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 text-gray-200"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
}
