// "use client" — needed for useEffect + useState (countdown timer interval).
"use client";

import { useEffect, useState } from "react";

// Countdown timer showing time remaining until the roll window closes.
// Updates every second via setInterval.
export function RollWindow({ closeTime }: { closeTime: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const target = new Date(closeTime).getTime();

    function update() {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Closed");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    }

    // Run immediately, then every second.
    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [closeTime]);

  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-widest text-foreground/50">
        Window closes in
      </p>
      <p className="font-mono text-lg text-foreground/70">
        {timeLeft}
      </p>
    </div>
  );
}
