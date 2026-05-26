"use client";

import { useEffect, useState } from "react";

type Phase = "typing" | "holding" | "deleting" | "pausing";

type Props = {
  text: string;
  className?: string;
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
  pauseMs?: number;
};

export default function Typewriter({
  text,
  className,
  typeMs = 75,
  deleteMs = 35,
  holdMs = 2200,
  pauseMs = 500,
}: Props) {
  const [shown, setShown] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (shown.length < text.length) {
        timer = setTimeout(
          () => setShown(text.slice(0, shown.length + 1)),
          typeMs,
        );
      } else {
        timer = setTimeout(() => setPhase("holding"), 0);
      }
    } else if (phase === "holding") {
      timer = setTimeout(() => setPhase("deleting"), holdMs);
    } else if (phase === "deleting") {
      if (shown.length > 0) {
        timer = setTimeout(
          () => setShown(text.slice(0, shown.length - 1)),
          deleteMs,
        );
      } else {
        timer = setTimeout(() => setPhase("pausing"), 0);
      }
    } else if (phase === "pausing") {
      timer = setTimeout(() => setPhase("typing"), pauseMs);
    }

    return () => clearTimeout(timer);
  }, [shown, phase, text, typeMs, deleteMs, holdMs, pauseMs]);

  return (
    <span className={className}>
      <span aria-label={text}>{shown}</span>
      <span aria-hidden="true" className="caret-blink ml-0.5 font-normal">
        |
      </span>
    </span>
  );
}
