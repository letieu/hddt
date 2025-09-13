
import { cn } from "@/lib/utils";
import React from "react";

const Steps = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative ml-4 border-l-2 border-gray-200 dark:border-gray-700">
      {children}
    </div>
  );
};

const Step = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("relative mb-8 pl-8", className)}>
      <div className="absolute -left-2.5 mt-1.5 h-5 w-5 rounded-full border-2 border-white bg-gray-300 dark:border-gray-800 dark:bg-gray-600"></div>
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        {children}
      </div>
    </div>
  );
};

export { Steps, Step };
