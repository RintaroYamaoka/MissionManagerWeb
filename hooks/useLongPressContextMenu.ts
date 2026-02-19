"use client";

import { useRef, useCallback } from "react";

const LONG_PRESS_MS = 550;
const MOVE_THRESHOLD_PX = 8;

/**
 * 右クリックまたは長押しでコンテキストメニューを開くためのハンドラを返す
 * タッチ・ポインター・マウスに対応
 */
export function useLongPressContextMenu(onOpen: (clientX: number, clientY: number) => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedByLongPressRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPosRef.current = null;
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onOpen(e.clientX, e.clientY);
    },
    [onOpen]
  );

  const startLongPressTimer = useCallback(
    (clientX: number, clientY: number) => {
      clearTimer();
      startPosRef.current = { x: clientX, y: clientY };
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        startPosRef.current = null;
        openedByLongPressRef.current = true;
        onOpen(clientX, clientY);
      }, LONG_PRESS_MS);
    },
    [onOpen, clearTimer]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      startLongPressTimer(touch.clientX, touch.clientY);
    },
    [startLongPressTimer]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const start = startPosRef.current;
      if (!touch || !start) return;
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dx) > MOVE_THRESHOLD_PX || Math.abs(dy) > MOVE_THRESHOLD_PX) {
        clearTimer();
      }
    },
    [clearTimer]
  );

  const handleTouchEnd = clearTimer;
  const handleTouchCancel = clearTimer;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      startLongPressTimer(e.clientX, e.clientY);
    },
    [startLongPressTimer]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const start = startPosRef.current;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) > MOVE_THRESHOLD_PX || Math.abs(dy) > MOVE_THRESHOLD_PX) {
        clearTimer();
      }
    },
    [clearTimer]
  );

  const handlePointerUp = clearTimer;
  const handlePointerCancel = clearTimer;
  const handlePointerLeave = clearTimer;

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
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
    onPointerLeave: handlePointerLeave,
    consumeLongPressClick,
  };
}
