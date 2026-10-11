function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, "'");
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
}

export type ReceiptPdfInput = {
  receiptNumber: string;
  customerName: string;
  vehicle: string;
  service: string;
  completedAt: string;
  lines: Array<{ label: string; amount: number }>;
  total: number;
};

/** Minimal dependency-free one-page PDF receipt for server-side email attachment. */
export function buildReceiptPdfBase64(input: ReceiptPdfInput) {
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", month: "long", day: "numeric", year: "numeric",
  }).format(new Date(input.completedAt));

  const commands: string[] = [];
  const text = (x: number, y: number, size: number, value: string) => {
    commands.push(`BT /F1 ${size} Tf ${x} ${y} Td (${pdfEscape(value)}) Tj ET`);
  };
  const line = (x1: number, y1: number, x2: number, y2: number) => commands.push(`${x1} ${y1} m ${x2} ${y2} l S`);

  text(48, 742, 20, "EVERY DETAIL");
  text(48, 722, 9, "Premium mobile detailing | Decatur, GA");
  line(48, 706, 564, 706);
  text(48, 676, 16, "RECEIPT");
  text(420, 678, 9, input.receiptNumber);
  text(48, 650, 10, input.customerName || "Customer");
  text(48, 634, 10, input.vehicle || "Vehicle");
  text(48, 618, 10, input.service || "Detail");
  text(420, 650, 9, date);

  let y = 574;
  line(48, y + 16, 564, y + 16);
  text(48, y, 9, "SERVICE");
  text(490, y, 9, "AMOUNT");
  y -= 26;
  for (const item of input.lines.slice(0, 15)) {
    text(48, y, 10, item.label.slice(0, 58));
    text(480, y, 10, money(item.amount));
    y -= 22;
  }
  line(48, y + 7, 564, y + 7);
  y -= 18;
  text(48, y, 12, "TOTAL");
  text(472, y, 12, money(input.total));
  y -= 52;
  text(48, y, 9, "Service completed. This receipt documents the completed Every Detail visit.");
  text(48, y - 18, 9, "Questions? Reply to your completion email or contact hello@everydetail.co.");

  const stream = commands.join("\n") + "\n";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}endstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "ascii").toString("base64");
}
