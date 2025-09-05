import { BulkDownloader } from "@/lib/download/bulk-downloader";
import { DownloadStorage, TaskResult } from "@/lib/download/storage";
import { describe, it, expect, beforeEach, vi } from "vitest";

export class MemoryStorage implements DownloadStorage {
  private completed = new Array<TaskResult>();

  async add(task: TaskResult): Promise<void> {
    this.completed.push(task);
  }

  async exist(id: string): Promise<boolean> {
    return !!this.completed.find((item) => item.taskId === id);
  }

  async items(): Promise<TaskResult[]> {
    return Array.from(this.completed);
  }

  clear(): void {
    this.completed = [];
  }
}

describe("BulkDownloader with storage", () => {
  let storage: DownloadStorage;
  let downloader: BulkDownloader;
  let logger: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storage = new MemoryStorage();
    logger = vi.fn();
    downloader = new BulkDownloader({ concurrency: 2, storage, logger });
  });

  it("runs tasks successfully and saves to storage", async () => {
    const t1 = mockTask("t1");
    const t2 = mockTask("t2");
    await downloader.addTask(t1);
    await downloader.addTask(t2);

    await downloader.run();
    await new Promise((r) => setTimeout(r, 20)); // wait for tasks

    expect(t1.run).toHaveBeenCalled();
    expect(t2.run).toHaveBeenCalled();
  });

  it("handles failed tasks", async () => {
    const t1 = mockTask("t1", false);
    await downloader.addTask(t1);

    await downloader.run();
    await new Promise((r) => setTimeout(r, 20));

    expect(t1.run).toHaveBeenCalled();
    expect(downloader.failed).toContain(t1);
  });

  it("skips already completed tasks", async () => {
    const result1 = {
      taskId: "task1",
      date: "date1",
      data: ["123"],
    };
    await storage.add(result1);

    const t1 = mockTask("task1");
    await downloader.addTask(t1);

    expect(downloader.queue.length).toBe(0);
    expect(t1.run).not.toHaveBeenCalled();
  });

  it("pause prevents running tasks", async () => {
    const t1 = mockTask("t1", true);
    await downloader.addTask(t1);

    downloader.pause();
    downloader.run();

    await new Promise((r) => setTimeout(r, 20));
    expect(t1.run).not.toHaveBeenCalled();
  });

  it("resume continues tasks after pause", async () => {
    const t1 = mockTask("t1");
    await downloader.addTask(t1);

    downloader.pause();
    downloader.run();

    await new Promise((r) => setTimeout(r, 20));
    expect(t1.run).not.toHaveBeenCalled();

    downloader.resume();
    await new Promise((r) => setTimeout(r, 20));
    expect(t1.run).toHaveBeenCalled();
  });

  it("retryFailed re-runs failed tasks", async () => {
    const t1 = mockTask("t1", false);
    await downloader.addTask(t1);
    await downloader.run();
    await new Promise((r) => setTimeout(r, 20));
    expect(downloader.failed).toContain(t1);

    // Now succeed
    t1.run = vi.fn(() =>
      Promise.resolve({
        taskId: "t1",
        date: "date1",
        data: ["123"],
      }),
    );
    downloader.retryFailed();
    await new Promise((r) => setTimeout(r, 20));

    expect(downloader.failed.length).toBe(0);
    expect(await storage.exist("t1")).toBe(true);
  });

  it("integration test", async () => {
    const t1 = mockTask("t1");
    const t2 = mockTask("t2");
    const t3 = mockTask("t3", false);
    const t4 = mockTask("t4");

    await downloader.addTask(t1);
    await downloader.addTask(t2);
    await downloader.addTask(t3);
    await downloader.addTask(t4);

    await downloader.run();
    await new Promise((r) => setTimeout(r, 20)); // wait for tasks

    expect(t1.run).toHaveBeenCalled();
    expect(t2.run).toHaveBeenCalled();
    expect(t3.run).toHaveBeenCalled();
    expect(t4.run).toHaveBeenCalled();

    expect((await downloader.storage.items()).length).toEqual(3);
    expect(downloader.failed.length).toEqual(1);
    expect(downloader.failed[0].id).toEqual('t3');
  });
});

// helper outside describe
function mockTask(id: string, succeed = true) {
  return {
    id,
    run: vi.fn(
      () =>
        new Promise<TaskResult>((resolve, reject) =>
          setTimeout(() =>
            succeed
              ? resolve({
                  taskId: id,
                  date: "date1",
                  data: ["123"],
                })
              : reject(new Error("fai")),
          ),
        ),
    ),
  };
}
