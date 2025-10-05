export async function convertHtmlToPdf(
  htmlContent: string,
  detailsJsContent?: string,
): Promise<Blob> {
  // const workerUrl =
  //   process.env.NEXT_PUBLIC_PDF_WORKER_URL ??
  //   "https://prawn-worker.tieu.dev";
  const workerUrl = "http://localhost:3001/generate-pdf";

  let finalHtmlContent = htmlContent;
  if (detailsJsContent) {
    const scriptTag = `<script>${detailsJsContent}</script>`;
    if (finalHtmlContent.includes("</body>")) {
      finalHtmlContent = finalHtmlContent.replace(
        "</body>",
        `${scriptTag}</body>`,
      );
    } else {
      finalHtmlContent += scriptTag;
    }
  }

  const formData = new FormData();
  formData.append("html", new Blob([finalHtmlContent]), "invoice.html");

  const response = await fetch(workerUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate PDF: ${response.status} ${errorText}`);
  }

  return response.blob();
}
