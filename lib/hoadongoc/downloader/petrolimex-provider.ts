import { DownloadParams, HoadongocDownloadProvider } from ".";

/**
 * Petrolimex - https://hoadon.petrolimex.com.vn
 **/
export class PetrolimexProvider implements HoadongocDownloadProvider {
  name = "Petrolimex";
  detectProvider(params: DownloadParams): boolean {
    console.log(params.nbcks, 'nbcks');
    return params.nbcks?.includes("TẬP ĐOÀN XĂNG DẦU VIỆT NAM");
  }

  lookupUrl(params: DownloadParams) {
    return "https://hoadon.petrolimex.com.vn/";
  }

  lookupInfo(params: DownloadParams) {
    const code = params.cttkhac.find((t) => t.ttruong === "Fkey")?.dlieu;

    return `Mã: ${code}`;
  }

  async download(params: DownloadParams): Promise<ArrayBuffer> {
    console.log(params);
    const lookupInfo = this.lookupInfo(params);
    console.log(lookupInfo);

    return new ArrayBuffer(0);
  }
}
