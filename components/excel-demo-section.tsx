"use client";

import { Download } from "lucide-react";

export function ExcelDemoSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-card to-muted">
      <div className="text-center mb-8 space-y-3">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          File Excel mẫu
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg px-4">
          Xem trước và tải về file Excel mẫu bên dưới.
        </p>
      </div>

      <div className="relative flex justify-center">
        <div className="relative w-full max-w-7xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-2 sm:p-3 md:p-4 overflow-hidden">
          {/* Download button (top-right corner, responsive size) */}
          <a
            href="https://docs.google.com/spreadsheets/d/e/2PACX-1vSJw79I4C-WHIWnX70blt7oj-LqjXLlJvDffvAMJKRFPorfAr7-GSnUb3EMCdJwKJNxYora1hzXIfAc/pub?output=xlsx"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-md p-1.5 sm:p-2 transition"
            title="Tải về file Excel"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-200" />
          </a>

          <iframe
            src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSJw79I4C-WHIWnX70blt7oj-LqjXLlJvDffvAMJKRFPorfAr7-GSnUb3EMCdJwKJNxYora1hzXIfAc/pubhtml?widget=true&amp;headers=false"
            width="100%"
            height="600"
            className="rounded-xl w-full sm:h-[700px] md:h-[800px]"
            style={{ border: "none" }}
          ></iframe>
        </div>
      </div>
    </section>
  );
}
