function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, "'");
}
function money(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0); }
export type ReceiptPdfInput = { receiptNumber:string; customerName:string; vehicle:string; service:string; completedAt:string; lines:Array<{label:string;amount:number}>; total:number; };

/** Branded, dependency-free one-page PDF receipt. */
export function buildReceiptPdfBase64(input: ReceiptPdfInput) {
  const date = new Intl.DateTimeFormat("en-US", { timeZone:"America/New_York", month:"long", day:"numeric", year:"numeric" }).format(new Date(input.completedAt));
  const c:string[]=[];
  const text=(x:number,y:number,size:number,value:string,bold=false,color="0.067 0.067 0.067")=>c.push(`${color} rg BT /${bold?"F2":"F1"} ${size} Tf ${x} ${y} Td (${pdfEscape(value)}) Tj ET`);
  const fill=(x:number,y:number,w:number,h:number,r:number,g:number,b:number)=>c.push(`${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f`);
  const stroke=(x1:number,y1:number,x2:number,y2:number)=>c.push(`0.78 0.76 0.72 RG 0.6 w ${x1} ${y1} m ${x2} ${y2} l S`);

  // Warm paper background and oxblood hero, matching the website palette.
  fill(0,0,612,792,0.953,0.945,0.925);
  fill(36,574,540,182,0.349,0.051,0.027);
  text(58,724,10,"EVERY DETAIL",true,"0.859 0.780 0.702");
  text(58,704,9,"PREMIUM MOBILE DETAILING  /  DECATUR + ATLANTA",false,"1 1 1");
  text(58,655,11,"SERVICE COMPLETE",true,"0.859 0.780 0.702");
  text(58,618,31,money(input.total),true,"1 1 1");
  text(58,596,10,"TOTAL FOR COMPLETED DETAIL",false,"0.953 0.945 0.925");
  text(420,724,9,input.receiptNumber,true,"1 1 1");

  text(48,535,9,"CUSTOMER",true,"0.722 0.212 0.239");
  text(48,515,13,input.customerName || "Customer",true);
  text(48,488,9,"VEHICLE",true,"0.722 0.212 0.239");
  text(48,468,12,input.vehicle || "Vehicle",true);
  text(326,535,9,"COMPLETED",true,"0.722 0.212 0.239");
  text(326,515,12,date,true);
  text(326,488,9,"SERVICE",true,"0.722 0.212 0.239");
  text(326,468,12,input.service || "Detail",true);

  stroke(48,438,564,438);
  text(48,414,9,"SERVICE BREAKDOWN",true,"0.349 0.051 0.027");
  text(500,414,9,"AMOUNT",true,"0.349 0.051 0.027");
  let y=382;
  for(const item of input.lines.slice(0,12)){
    text(48,y,11,item.label.slice(0,58),false);
    text(486,y,11,money(item.amount),true);
    y-=28;
  }
  stroke(48,y+8,564,y+8);
  y-=25;
  text(48,y,11,"TOTAL",true);
  text(474,y,18,money(input.total),true,"0.349 0.051 0.027");

  fill(48,72,516,76,0.922,0.902,0.867);
  text(64,121,10,"THANKS FOR TRUSTING EVERY DETAIL.",true,"0.349 0.051 0.027");
  text(64,101,9,"This receipt documents your completed service. No payment is requested.");
  text(64,84,9,"Questions? Reply to your completion email or contact hello@everydetail.co.");

  const stream=c.join("\n")+"\n";
  const objects=[
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream,"ascii")} >>\nstream\n${stream}endstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];
  let pdf="%PDF-1.4\n"; const offsets=[0];
  objects.forEach((obj,i)=>{offsets.push(Buffer.byteLength(pdf,"ascii"));pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`;});
  const xref=Buffer.byteLength(pdf,"ascii"); pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
  for(let i=1;i<=objects.length;i++) pdf+=`${String(offsets[i]).padStart(10,"0")} 00000 n \n`;
  pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf,"ascii").toString("base64");
}
