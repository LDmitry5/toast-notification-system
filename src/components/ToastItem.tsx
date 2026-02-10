import { useEffect, useRef, useState, type FC } from "react";
import type { Toast } from "../types/types";

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export const ToastItem: FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [remainingTime, setRemainingTime] = useState(toast.duration ?? 3000);
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setRemainingTime(toast.duration ?? 3000);
    if (!isPaused && !isExiting) startTimer();
  }, [toast.duration]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const startTime = Date.now();
    const endTime = startTime + remainingTime;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setRemainingTime(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        handleClose();
      }
    }, 50);
  };

  useEffect(() => {
    if (isPaused || isExiting) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimer();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isExiting, remainingTime]);

  const handleMouseEnter = () => setIsPaused(true);

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTimer();
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  // Формируем классы с учётом состояний анимации
  const getToastClassName = () => {
    const baseClass = `toast toast-${toast.type}`;
    if (!isMounted) return `${baseClass} entering`;
    if (isExiting) return `${baseClass} exiting`;
    return baseClass;
  };
  return (
    <div className={getToastClassName()} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <span>{toast.message}</span>
      <span>{remainingTime}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}>
        x
      </button>
    </div>
  );
};
