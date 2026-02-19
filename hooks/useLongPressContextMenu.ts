"use client";

import { useRef, useCallback } from "react";

const LONG_PRESS_MS = 500;

/**
 * 右クリックまたは長押しでコンテキストメニューを開くためのハンドラを返す
 * openedByLongPressRef: 長押しで開いた直後にセットされ、次のクリックでリセット。onClickで展開等を防ぐためにチェック可能
 */
export function useLongPressContextMenu(onOpen: (clientX: number, clientY: number) => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedByLongPressRef = useRef(false);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onOpen(e.clientX, e.clientY);
    },
    [onOpen]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        openedByLongPressRef.current = true;
        onOpen(touch.clientX, touch.clientY);
      }, LONG_PRESS_MS);
    },
    [onOpen]
  );

  const handleTouchEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTouchCancel = handleTouchEnd;

  const consumeLongPressClick = useCallback(() => {
    if (openedByLongPressRef.current) {
      openedByLongPressRef.current = false;
      return true;
    }
    return false;
  }, []);

  return {
    onContextMenu: handleContextMenu,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    consumeLongPressClick,
  };
}
