import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base
        "w-full h-10 px-4 py-2 text-sm md:text-base outline-none",
        "rounded-xl border border-border bg-background/60 dark:bg-input/30",
        "placeholder:text-muted-foreground/50 selection:bg-primary selection:text-primary-foreground",
        "file:inline-flex file:h-8 file:px-3 file:rounded-md file:border file:border-border file:bg-muted/30 file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",

        // Interaction
        "transition-all duration-200 ease-in-out",
        "hover:border-ring/60 hover:shadow-sm",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:shadow-md",

        // Invalid state
        "aria-invalid:border-destructive aria-invalid:ring-destructive/30",

        className,
      )}
      {...props}
    />
  );
}

export { Input };
