import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export type PdfDocument = {
  title: string;
  fileName: string;
  details: { label: string; value: string }[];
  items: {
    name: string;
    detail?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  summary: { label: string; amount: number; emphasize?: boolean }[];
  footer?: string;
};

function formatCLP(amount: number) {
  return `$${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(amount)}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtml(document: PdfDocument) {
  const details = document.details
    .map(({ label, value }) =>
      `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`,
    )
    .join('');
  const items = document.items
    .map((item) => `
      <tr>
        <td>${escapeHtml(item.name)}${item.detail ? `<small>${escapeHtml(item.detail)}</small>` : ''}</td>
        <td>${item.quantity}</td>
        <td>${formatCLP(item.unitPrice)}</td>
        <td>${formatCLP(item.total)}</td>
      </tr>`)
    .join('');
  const summary = document.summary
    .map(({ label, amount, emphasize }) => `
      <p class="${emphasize ? 'total' : ''}">
        <span>${escapeHtml(label)}</span><strong>${formatCLP(amount)}</strong>
      </p>`)
    .join('');

  return `<!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(document.title)}</title>
        <style>
          @page { margin: 18mm; }
          body { font-family: Arial, sans-serif; color: #25243A; margin: 0; }
          header { border-bottom: 2px solid #5B32EC; padding-bottom: 12px; margin-bottom: 18px; }
          .brand { color: #5B32EC; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; }
          h1 { font-size: 22px; margin: 8px 0 0; }
          .details { margin-bottom: 18px; }
          .details p { margin: 5px 0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #5B32EC; color: white; text-align: left; }
          th, td { padding: 9px 7px; border-bottom: 1px solid #E8E5EF; }
          td:not(:first-child), th:not(:first-child) { text-align: right; white-space: nowrap; }
          small { display: block; color: #77768A; margin-top: 3px; }
          .summary { margin: 16px 0 0 auto; max-width: 260px; }
          .summary p { display: flex; justify-content: space-between; gap: 16px; margin: 7px 0; font-size: 12px; }
          .summary .total { border-top: 1px solid #D8D1F6; padding-top: 9px; color: #5B32EC; font-size: 15px; }
          footer { border-top: 1px solid #E8E5EF; padding-top: 10px; margin-top: 24px; color: #77768A; font-size: 10px; }
        </style>
      </head>
      <body>
        <header><div class="brand">SHOPPING</div><h1>${escapeHtml(document.title)}</h1></header>
        <section class="details">${details}</section>
        <table>
          <thead><tr><th>Producto</th><th>Cant.</th><th>Precio unit.</th><th>Total</th></tr></thead>
          <tbody>${items}</tbody>
        </table>
        <section class="summary">${summary}</section>
        ${document.footer ? `<footer>${escapeHtml(document.footer)}</footer>` : ''}
      </body>
    </html>`;
}

async function downloadInBrowser(document: PdfDocument) {
  const { jsPDF } = await import('jspdf/dist/jspdf.es.min.js');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const descriptionWidth = 85;
  const quantityX = 113;
  const unitPriceX = 157;
  const totalX = pageWidth - margin;
  let y = margin;

  const drawTableHeader = () => {
    pdf.setFillColor(91, 50, 236);
    pdf.rect(margin, y, contentWidth, 9, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text('Producto', margin + 2, y + 6);
    pdf.text('Cant.', quantityX, y + 6, { align: 'right' });
    pdf.text('Precio unit.', unitPriceX, y + 6, { align: 'right' });
    pdf.text('Total', totalX - 2, y + 6, { align: 'right' });
    y += 12;
  };

  const addPage = (repeatTable = false) => {
    pdf.addPage();
    y = margin;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(91, 50, 236);
    pdf.text(`${document.title} (continuación)`, margin, y);
    y += 10;
    if (repeatTable) drawTableHeader();
  };

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(91, 50, 236);
  pdf.text('SHOPPING', margin, y);
  y += 9;
  pdf.setFontSize(19);
  pdf.text(pdf.splitTextToSize(document.title, contentWidth), margin, y);
  y += 12;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(37, 36, 58);
  for (const field of document.details) {
    const lines = pdf.splitTextToSize(`${field.label}: ${field.value}`, contentWidth);
    for (const line of lines) {
      if (y > pageHeight - 20) addPage();
      pdf.text(line, margin, y);
      y += 5;
    }
  }
  y += 5;
  drawTableHeader();

  for (const item of document.items) {
    const nameLines = pdf.splitTextToSize(item.name, descriptionWidth);
    const detailLines = item.detail ? pdf.splitTextToSize(item.detail, descriptionWidth) : [];
    const rowHeight = Math.max(11, nameLines.length * 4 + detailLines.length * 3.5 + 5);
    if (y + rowHeight > pageHeight - 18) addPage(true);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(37, 36, 58);
    pdf.text(nameLines, margin + 2, y + 3);
    if (detailLines.length) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(119, 118, 138);
      pdf.text(detailLines, margin + 2, y + 3 + nameLines.length * 4);
    }
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(37, 36, 58);
    pdf.text(String(item.quantity), quantityX, y + 4, { align: 'right' });
    pdf.text(formatCLP(item.unitPrice), unitPriceX, y + 4, { align: 'right' });
    pdf.text(formatCLP(item.total), totalX - 2, y + 4, { align: 'right' });
    y += rowHeight;
    pdf.setDrawColor(232, 229, 239);
    pdf.line(margin, y, pageWidth - margin, y);
  }

  y += 7;
  for (const entry of document.summary) {
    if (y > pageHeight - 20) addPage();
    pdf.setFont('helvetica', entry.emphasize ? 'bold' : 'normal');
    pdf.setFontSize(entry.emphasize ? 12 : 10);
    if (entry.emphasize) pdf.setTextColor(91, 50, 236);
    else pdf.setTextColor(37, 36, 58);
    pdf.text(entry.label, margin, y);
    pdf.text(formatCLP(entry.amount), totalX, y, { align: 'right' });
    y += entry.emphasize ? 8 : 6;
  }

  if (document.footer) {
    const footerLines = pdf.splitTextToSize(document.footer, contentWidth);
    const footerHeight = footerLines.length * 4 + 8;
    if (y + footerHeight > pageHeight - margin) addPage();
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(119, 118, 138);
    pdf.text(footerLines, margin, y);
  }

  const fileName = document.fileName.replace(/[\\/:*?"<>|]+/g, '-').replace(/\.pdf$/i, '');
  pdf.save(`${fileName}.pdf`);
}

export async function exportPdfDocument(document: PdfDocument) {
  if (Platform.OS === 'web') {
    await downloadInBrowser(document);
    return;
  }

  const { uri } = await Print.printToFileAsync({ html: buildHtml(document) });
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('No está disponible compartir archivos en este dispositivo.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: document.title,
    UTI: 'com.adobe.pdf',
  });
}
