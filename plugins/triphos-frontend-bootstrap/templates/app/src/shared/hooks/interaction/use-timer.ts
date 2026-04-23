import { useEffect, useState } from 'react';

export function useTimer(initialSeconds: number, autoStart = false) {
  const [timerValue, setTimerValue] = useState(() => initialSeconds);
  const [isRunning, setIsRunning] = useState(() => autoStart);

  const resetTimer = () => {
    setTimerValue(initialSeconds);
    setIsRunning(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const startTimer = () => {
    setTimerValue((current) => (current === 0 ? initialSeconds : current));
    setIsRunning(true);
  };

  const toggleTimer = () => {
    if (isRunning) {
      stopTimer();
      return;
    }

    startTimer();
  };

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setInterval(() => {
      setTimerValue((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsRunning(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isRunning]);

  const min = Math.floor(timerValue / 60);
  const sec = timerValue % 60;

  return {
    time: timerValue,
    isRunning,
    formatTime: `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`,
    resetTimer,
    stopTimer,
    startTimer,
    toggleTimer,
  };
}
