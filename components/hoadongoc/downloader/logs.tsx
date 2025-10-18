"use client";

import { Terminal, TypingAnimation } from "@/components/magicui/terminal";
import { LogEntry } from "@/lib/hoadongoc/types";
import { cn } from "@/lib/utils";

interface LogsProps {
  logs: Map<string, LogEntry>;
}

export function Logs({ logs }: LogsProps) {
  return (
    <Terminal>
      {logs.size === 0 && (
        <TypingAnimation className="text-muted-foreground">
          Chưa có tiến trình nào...
        </TypingAnimation>
      )}
      {Array.from(logs.entries()).map(([id, log]) => (
        <div key={id}>
          <span
            className={cn({
              "text-red-500": log.status === "failed",
              "text-green-500 font-bold": log.status === "success",
            })}
          >
            {log.message}
          </span>
        </div>
      ))}
    </Terminal>
  );
}