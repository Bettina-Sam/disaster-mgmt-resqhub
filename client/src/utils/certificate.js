import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Capture a DOM node to a high-res PNG download.
 */
export async function downloadPNGFromNode(node, filename = "certificate.png") {
  const canvas = await html2canvas(node, {
    backgroundColor: null,
    scale: 2,            // crisp output
    useCORS: true,
  });
  const data = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = data;
  a.download = filename;
  a.click();
}

/**
 * Capture a DOM node to a landscape PDF (A4) download.
 */
export async function downloadPDFFromNode(node, filename = "certificate.pdf") {
  const canvas = await html2canvas(node, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Fit image into page (keeping aspect)
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
  const w = imgWidth * ratio;
  const h = imgHeight * ratio;
  const x = (pageWidth - w) / 2;
  const y = (pageHeight - h) / 2;

  pdf.addImage(imgData, "PNG", x, y, w, h, undefined, "FAST");
  pdf.save(filename);
}
