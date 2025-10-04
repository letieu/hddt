import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function convertHtmlToPdf(htmlContent: string): Promise<Blob> {
  const container = document.createElement("div");
  // Hide the container from view
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.width = "1024px"; // A reasonable width for invoices

  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");

    // Create a PDF with the same dimensions as the canvas
    const pdf = new jsPDF({
      orientation: "p",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    return pdf.getBlob();
  } finally {
    // Clean up the container from the DOM
    document.body.removeChild(container);
  }
}
