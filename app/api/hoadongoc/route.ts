import { getDownloadProvider } from "@/lib/hoadongoc/downloader";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { msttcgp, nbmst, id, ttkhac, cttkhac, khhdon, shdon, nbcks } =
    await req.json();
  const params = {
    msttcgp,
    nbmst,
    id,
    ttkhac,
    cttkhac,
    khhdon,
    shdon,
    nbcks,
  };

  const downloadProvider = getDownloadProvider(params);
  if (!downloadProvider) {
    console.error("No provider found for", params);
    return new NextResponse("No provider found", { status: 404 });
  }

  const res = await downloadProvider.download(params);
  console.log("Downloaded", params);

  return new NextResponse(res, {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
