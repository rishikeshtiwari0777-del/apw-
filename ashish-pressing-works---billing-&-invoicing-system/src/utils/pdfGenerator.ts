import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadInvoicePDF(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    // Render element to high-res canvas
    const canvas = await html2canvas(element, {
      scale: 3, // High DPI for crystal clear print-quality text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    // Calculate aspect ratio fit
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;

    let targetWidth = pdfWidth;
    let targetHeight = pdfWidth / ratio;

    // If height exceeds A4, fit to height
    if (targetHeight > pdfHeight) {
      targetHeight = pdfHeight;
      targetWidth = pdfHeight * ratio;
    }

    const marginX = (pdfWidth - targetWidth) / 2;
    const marginY = 0; // Top aligned

    pdf.addImage(imgData, 'PNG', marginX, marginY, targetWidth, targetHeight, undefined, 'FAST');
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF with html2canvas:', error);
    // Fallback: trigger system print which allows instant "Save as PDF"
    window.print();
    return false;
  }
}

export function triggerPrintInvoice(): void {
  window.print();
}
