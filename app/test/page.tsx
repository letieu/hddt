"use client";

import { BulkDownloader, Task } from "@/lib/download/bulk-downloader";
import { MemoryStorage } from "@/lib/download/memory-storage";
import { createMockTask } from "@/lib/download/mock-task";
import { useState, useRef } from "react";

export default function DownloaderPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [failed, setFailed] = useState<string[]>([]);

  const downloaderRef = useRef<BulkDownloader | null>(null);
  const storageRef = useRef(new MemoryStorage());

  const log = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
  };

  const setupDownloader = () => {
    const downloader = new BulkDownloader({
      concurrency: 10,
      storage: storageRef.current,
      logger: log,
    });
    downloaderRef.current = downloader;
    return downloader;
  };

  const startDownload = async () => {
    const downloader = setupDownloader();

    // create 10 mock tasks
    for (let i = 1; i <= 10; i++) {
      const task = createMockTask(`task-${i}`);
      await downloader.addTask(task);
    }

    downloader.run();

    // Poll storage to update UI
    const interval = setInterval(async () => {
      const list = await storageRef.current.items();
      setCompleted(list.map((r) => r.taskId));
      setFailed(downloader.failed.map((t: Task) => t.id));
      if (completed.length >= 10) clearInterval(interval);
    }, 500);
  };

  const pause = () => downloaderRef.current?.pause();
  const resume = () => downloaderRef.current?.resume();
  const retryFailed = () => downloaderRef.current?.retryFailed();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Bulk Downloader Demo</h1>

      <div className="space-x-2">
        <button
          onClick={startDownload}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Start
        </button>
        <button
          onClick={pause}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Pause
        </button>
        <button
          onClick={resume}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Resume
        </button>
        <button
          onClick={retryFailed}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Retry Failed
        </button>
      </div>

      <div>
        <h2 className="font-semibold">Completed Tasks</h2>
        <ul className="list-disc ml-6">
          {completed.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold text-red-600">Failed Tasks</h2>
        <ul className="list-disc ml-6">
          {failed.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold">Logs</h2>
        <pre className="bg-gray-100 p-2 rounded max-h-60 overflow-y-auto">
          {logs.join("\n")}
        </pre>
      </div>
    </div>
  );
}
