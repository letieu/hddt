export class RateLimiter {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private lastRequestTime = 0;

  constructor(
    private requestsPerSecond: number = 3,
    private maxRetries: number = 10,
    private timeout: number = 14_000,
  ) {}

  async execute(apiCall: () => Promise<Response>): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await this.makeRequestWithRateLimitedRetry(apiCall);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      await request();
    }

    this.processing = false;
  }

  // 🔥 This is where we integrate your retry logic WITH rate limiting
  private async makeRequestWithRateLimitedRetry(
    apiCall: () => Promise<Response>,
  ): Promise<Response> {
    for (let i = 0; i < this.maxRetries; i++) {
      // ✅ ALWAYS respect rate limit before each attempt (including retries)
      await this.respectRateLimit();

      // ✅ Use your exact timeout and abort logic
      const controller = new AbortController();

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, this.timeout);

      try {
        const response = await apiCall();
        clearTimeout(timeoutId);

        // ✅ Use your exact retry conditions
        if (response.status === 500) {
          const responseObject = await response.json().catch(() => null);
          if (responseObject?.message?.includes("Không tồn tại")) {
            throw new Error("Không tồn tại");
          }

          console.log(
            `Server error (500). Retrying... (${i + 1}/${this.maxRetries})`,
          );
          continue; // This will go to next iteration, which will respect rate limit again
        }

        if (response.status === 429) {
          console.log(
            `Rate limited (429). Retrying... (${i + 1}/${this.maxRetries})`,
          );
          await this.delay(2_000); // Wait 2 seconds like your original
          continue; // This will go to next iteration, which will respect rate limit again
        }

        return response;
      } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.message === "Không tồn tại") {
          console.log("Không tồn tại, skip retry");
          throw new Error("Không tồn tại");
        }

        console.log(`Request fail. Retrying... (${i + 1}/${this.maxRetries})`);

        // ✅ Use your exponential backoff, but STILL respect rate limit on next attempt
        await this.delay(20_000 * (i + 1)); // Wait from 10s to 100s
        // Next iteration will call respectRateLimit() again
      }
    }

    throw new Error("Max retries reached");
  }

  private async respectRateLimit() {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    const minInterval = 1000 / this.requestsPerSecond;

    if (timeSinceLastRequest < minInterval) {
      await this.delay(minInterval - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
