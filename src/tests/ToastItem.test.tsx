import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Toast } from "../types/types";
import { ToastItem } from "../components/ToastItem";

// Mock функции
const mockRemoveToast = vi.fn();

// Вспомогательная функция для ожидания
const advanceTime = (ms: number) => {
  vi.advanceTimersByTime(ms);
};

describe("ToastItem", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockRemoveToast.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("должен останавливать таймер при наведении курсора и не удаляться в положенное время", async () => {
    // Arrange
    const toast: Toast = {
      id: "1",
      message: "Тестовое сообщение",
      type: "success",
      duration: 3000,
    };

    render(<ToastItem toast={toast} onRemove={mockRemoveToast} />);

    // Act: находим элемент тоста
    const toastElement = screen.getByText("Тестовое сообщение").parentElement as HTMLElement;

    // Act 1: наводим курсор на тост (останавливаем таймер)
    fireEvent.mouseEnter(toastElement);

    // Act 2: ждём 3500 мс (больше, чем duration)
    advanceTime(3500);

    // Assert 1: проверяем, что тост всё ещё на экране
    expect(screen.getByText("Тестовое сообщение")).toBeInTheDocument();

    // Assert 2: проверяем, что removeToast не был вызван
    expect(mockRemoveToast).not.toHaveBeenCalled();

    // Act 3: убираем курсор (возобновляем таймер)
    fireEvent.mouseLeave(toastElement);

    // Act 4: Ждём завершения таймера
    advanceTime(3500);

    // Assert 3: проверяем, что таймер сработал и тост был удалён
    expect(mockRemoveToast).toHaveBeenCalledWith("1");
  });
});
