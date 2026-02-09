import { useEffect, useRef, useState, type FC } from "react";
import type { Toast } from "../types/types";

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export const ToastItem: FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [remainingTime, setRemainingTime] = useState(toast.duration);
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const startTime = Date.now();
    const endTime = startTime + (toast.duration ?? 3000);

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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, isExiting, toast.duration]);

  const handleMouseEnter = () => setIsPaused(true);

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now();
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
      <pre>{remainingTime}</pre>
      <button onClick={handleClose}>x</button>
    </div>
  );
};
