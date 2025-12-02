import { DownloadParams, HoadongocDownloadProvider } from ".";
import { getProviderDetail } from "../hoadongoc-provider-list";

export class FallbackProvider implements HoadongocDownloadProvider {
  name = "Fallback provider";

  detectProvider(_params: DownloadParams): boolean {
    return true;
  }

  lookupUrl(params: DownloadParams): string {
    const providerInfo = getProviderDetail(params);
    return providerInfo?.lookup || "";
  }

  lookupInfo(_params: DownloadParams): string {
    return "";
  }

  async download(_params: DownloadParams): Promise<ArrayBuffer> {
    throw new Error("Download is not supported by FallbackProvider");
  }
}
