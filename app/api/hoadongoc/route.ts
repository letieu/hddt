import { meinvoiceProvider } from "@/lib/hoadongoc/hoadongoc-downloader";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { msttcgp, nbmst, id, ttkhac } = await req.json();
  const res = await meinvoiceProvider.download({
    msttcgp,
    nbmst,
    id,
    ttkhac,
  });

  return new NextResponse(res, {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
