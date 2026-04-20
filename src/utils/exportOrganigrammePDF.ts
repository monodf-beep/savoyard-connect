import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export async function exportOrganigrammePDF(
  element: HTMLElement,
  filename = 'organigramme.pdf',
  title = 'Organigramme'
) {
  const toastId = toast.loading('Génération du PDF en cours...');
  try {
    // Force-expand all collapsible content via temp class hint (caller responsibility)
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgWidth = 210; // A4 width mm
    const pageHeight = 297; // A4 height mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');

    // Header on first page
    pdf.setFontSize(16);
    pdf.text(title, 10, 12);
    pdf.setFontSize(9);
    pdf.setTextColor(120);
    pdf.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 10, 18);
    pdf.setTextColor(0);

    const topOffset = 24;
    const usableHeight = pageHeight - topOffset - 8;
    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    if (imgHeight <= usableHeight) {
      pdf.addImage(imgData, 'JPEG', 0, topOffset, imgWidth, imgHeight);
    } else {
      // Multi-page: slice the canvas
      let position = 0;
      const pageCanvasHeight = (usableHeight * canvas.width) / imgWidth;
      let pageIndex = 0;

      while (position < canvas.height) {
        const sliceHeight = Math.min(pageCanvasHeight, canvas.height - position);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeight;
        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) break;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          position,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );
        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.92);
        const sliceImgHeight = (sliceHeight * imgWidth) / canvas.width;

        if (pageIndex > 0) {
          pdf.addPage();
        } else {
          // first page already has header
        }
        const yOffset = pageIndex === 0 ? topOffset : 8;
        pdf.addImage(sliceData, 'JPEG', 0, yOffset, imgWidth, sliceImgHeight);
        position += sliceHeight;
        pageIndex += 1;
      }
    }

    pdf.save(filename);
    toast.success('PDF généré avec succès', { id: toastId });
  } catch (e) {
    console.error('PDF export error', e);
    toast.error('Erreur lors de la génération du PDF', { id: toastId });
  }
}
