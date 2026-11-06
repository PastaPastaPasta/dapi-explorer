import { useEffect, useState } from "react";

export function Freshness({ value }: { value: number }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const date = new Date(value);
  const minutes = Math.max(0, Math.floor((now - value) / 60_000));
  const age =
    minutes < 1
      ? "just now"
      : minutes < 60
        ? `${minutes} min ago`
        : minutes < 1440
          ? `${Math.floor(minutes / 60)} h ago`
          : `${Math.floor(minutes / 1440)} d ago`;
  return (
    <time
      className="dh-time"
      dateTime={date.toISOString()}
      title={
        date.toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "UTC",
        }) + " UTC"
      }
    >
      {age}
    </time>
  );
}
