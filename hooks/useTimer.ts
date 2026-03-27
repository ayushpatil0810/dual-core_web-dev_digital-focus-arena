import { useEffect, useState } from "react";

export function useTimer(endsAt: string | null) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!endsAt) return;
    
    const interval = setInterval(() => {
      const diff = new Date(endsAt).getTime() - Date.now();
      const newRemaining = Math.max(0, Math.floor(diff / 1000));
      setRemaining(newRemaining);
      
      if (diff <= 0) clearInterval(interval);
    }, 1000);
    
    // Initial calculation
    const initialDiff = new Date(endsAt).getTime() - Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setRemaining(Math.max(0, Math.floor(initialDiff / 1000)));

    return () => clearInterval(interval);
  }, [endsAt]);

  return remaining; // seconds
}
