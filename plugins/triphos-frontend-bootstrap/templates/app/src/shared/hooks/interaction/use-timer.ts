import { useEffect, useState } from 'react';

export function useTimer(initialSeconds: number, start = false) {
  const [timerValue, setTimerValue] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(start);

  const resetTimer = () => {
    setTimerValue(initialSeconds);
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  useEffect(() => {
    setTimerValue(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setInterval(() => {
      setTimerValue((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isRunning]);

  const min = Math.floor(timerValue / 60);
  const sec = timerValue % 60;

  return {
    time: timerValue,
    formatTime: `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`,
    resetTimer,
    stopTimer,
    startTimer,
  };
}

