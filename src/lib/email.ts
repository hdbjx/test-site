type EmailAttachment = {
  filename: string;
  content: string; // base64
};

type EmailMessage = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
};

type BookingEmail = {
  name: string;
  email: string;
  phone: string;
  address: string;
  service: string;
  vehicle: string;
  start: string;
  price: number;
  notes?: string;
  leadSource?: string;
  leadSourceDetail?: string;
  lines?: Array<{ vehicle: string; service: string; price: number }>;
};

type LeadEmail = {
  type: string;
  fields: Record<string, string>;
};

const BRAND = {
  red: "#590d07",
  oxblood: "#590d07",
  coral: "#b8363d",
  cream: "#f3f1ec",
  beige: "#dbc7b3",
  black: "#111111",
  gray: "#666666",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAppointment(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function shell(content: string, preheader = "") {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Every Detail</title>
    <style>
      @media only screen and (max-width: 620px) {
        .ed-wrap { padding-left: 18px !important; padding-right: 18px !important; }
        .ed-hero { font-size: 36px !important; }
        .ed-meta-label { width: 94px !important; }
        .ed-two-col { display:block !important; width:100% !important; padding-left:0 !important; padding-right:0 !important; }
        .ed-two-col + .ed-two-col { padding-top:10px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.cream};font-family:Arial,Helvetica,sans-serif;color:${BRAND.black};">
    <div style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;color:transparent;">
      ${escapeHtml(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.cream};">
      <tr>
        <td align="center" style="padding:24px 12px 34px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:680px;">
            <tr>
              <td class="ed-wrap" style="padding:14px 4px 18px;border-bottom:1px solid rgba(17,17,17,.16);">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="font-size:12px;line-height:1.2;letter-spacing:2.1px;font-weight:900;color:${BRAND.oxblood};">EVERY DETAIL</td>
                    <td align="right" style="font-size:10px;line-height:1.2;letter-spacing:1.3px;font-weight:700;color:${BRAND.gray};">DECATUR + ATLANTA</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="ed-wrap" style="padding:36px 4px 28px;">
                ${content}
              </td>
            </tr>

            <tr>
              <td style="padding:0 4px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.oxblood};">
                  <tr>
                    <td class="ed-wrap" style="padding:24px 26px;color:${BRAND.cream};">
                      <div style="font-size:11px;line-height:1.3;letter-spacing:1.6px;font-weight:900;">EVERY DETAIL</div>
                      <div style="margin-top:7px;font-size:12px;line-height:1.65;color:#efe7df;">Mobile detailing, brought to your driveway. Questions or changes? Reply directly to this email.</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

function eyebrow(value: string) {
  return `<div style="font-size:10px;line-height:1.2;letter-spacing:1.9px;text-transform:uppercase;color:${BRAND.oxblood};font-weight:900;">${escapeHtml(value)}</div>`;
}

function headline(value: string) {
  return `<h1 class="ed-hero" style="margin:10px 0 14px;font-size:44px;line-height:.98;letter-spacing:-1.8px;color:${BRAND.black};font-weight:800;">${value}</h1>`;
}

function lede(value: string) {
  return `<p style="margin:0 0 26px;font-size:17px;line-height:1.65;color:#4f4c49;">${value}</p>`;
}

function detailRow(label: string, value: string) {
  return `
    <tr>
      <td class="ed-meta-label" style="padding:12px 0;border-bottom:1px solid rgba(17,17,17,.12);font-size:11px;line-height:1.35;letter-spacing:1px;text-transform:uppercase;color:${BRAND.gray};vertical-align:top;width:132px;font-weight:700;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid rgba(17,17,17,.12);font-size:14px;line-height:1.45;color:${BRAND.black};font-weight:800;vertical-align:top;">
        ${escapeHtml(value)}
      </td>
    </tr>
  `;
}

function detailPanel(rows: string, label = "The details") {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 22px;background:#ebe6dd;border:1px solid rgba(17,17,17,.12);">
      <tr><td style="padding:18px 20px 6px;font-size:10px;line-height:1.2;letter-spacing:1.7px;text-transform:uppercase;color:${BRAND.oxblood};font-weight:900;">${escapeHtml(label)}</td></tr>
      <tr><td style="padding:0 20px 16px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation">${rows}</table></td></tr>
    </table>
  `;
}

function noteBlock(title: string, body: string) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0;background:#ffffff;border:1px solid rgba(17,17,17,.14);">
      <tr><td style="padding:18px 20px;">
        <div style="font-size:11px;line-height:1.3;color:${BRAND.black};font-weight:900;">${escapeHtml(title)}</div>
        <div style="margin-top:6px;font-size:14px;line-height:1.65;color:${BRAND.gray};">${body}</div>
      </td></tr>
    </table>
  `;
}

export function buildGiftCardRequestEmail(input: {
  purchaserName: string;
  recipientName: string;
  amount: number;
  reference: string;
  paymentMethod: "venmo" | "zelle";
  paymentTarget?: string;
  paymentUrl?: string;
  deliveryMode: "purchaser" | "recipient";
}) {
  const recipient = escapeHtml(input.recipientName);
  const purchaserFirst = escapeHtml(input.purchaserName.trim().split(/\s+/)[0] || input.purchaserName || "there");
  const amount = formatMoney(input.amount);
  const methodLabel = input.paymentMethod === "venmo" ? "Venmo" : "Zelle";
  const target = input.paymentTarget ? escapeHtml(input.paymentTarget) : "Every Detail payment details";
  const paymentCta = input.paymentMethod === "venmo" && input.paymentUrl
    ? `<tr><td style="padding:0 0 22px;"><a href="${escapeHtml(input.paymentUrl)}" style="display:inline-block;padding:12px 17px;background:${BRAND.coral};border:1px solid ${BRAND.black};box-shadow:3px 3px 0 ${BRAND.black};color:#ffffff;text-decoration:none;font-weight:900;">Open Venmo ↗</a></td></tr>`
    : "";
  const deliveryCopy = input.deliveryMode === "recipient"
    ? "As soon as payment is confirmed, we’ll email the active gift card to the recipient."
    : "As soon as payment is confirmed, we’ll email the active gift card to you so you can send it yourself.";

  return shell(`
    <div style="font-size:11px;line-height:1.2;letter-spacing:1.8px;text-transform:uppercase;color:${BRAND.coral};font-weight:800;">Gift card request received</div>
    <h1 style="margin:10px 0 12px;font-size:34px;line-height:0.98;letter-spacing:-1.2px;color:${BRAND.black};">Your gift card is almost ready.</h1>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:${BRAND.gray};">Hey ${purchaserFirst}, we reserved ${amount} for ${recipient}. Send payment using the details below and include your reference number so we can activate it quickly.</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 26px;">
      <tr>
        <td style="padding:0;">
          <div style="padding:24px;border-radius:22px;background:${BRAND.oxblood};color:#ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="font-size:11px;letter-spacing:2px;font-weight:800;">EVERY DETAIL</td>
                <td align="right" style="font-size:12px;font-weight:800;">GIFT CARD</td>
              </tr>
              <tr><td colspan="2" style="padding:24px 0 32px;font-size:42px;line-height:0.9;font-weight:900;letter-spacing:-2px;">A better kind<br>of clean.</td></tr>
              <tr>
                <td style="font-size:11px;letter-spacing:1.6px;">MOBILE DETAILING · DECATUR + ATLANTA</td>
                <td align="right"><span style="display:inline-block;width:34px;height:34px;line-height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.7);text-align:center;font-size:14px;font-weight:800;">ED</span></td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 22px;border:1px solid #dedbd5;border-radius:18px;overflow:hidden;background:#faf8f4;">
      <tr><td style="padding:18px 20px 10px;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:${BRAND.black};font-weight:800;">Payment details</td></tr>
      <tr><td style="padding:0 20px 18px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${detailRow('Amount', amount)}
          ${detailRow('Reference', input.reference)}
          ${detailRow('Method', methodLabel)}
          ${detailRow('Send to', target)}
        </table>
      </td></tr>
    </table>

    ${paymentCta}

    <div style="padding:18px 20px;border-radius:18px;background:${BRAND.cream};border:1px solid #dedbd5;margin-bottom:20px;">
      <div style="font-weight:800;font-size:13px;color:${BRAND.black};margin-bottom:8px;">What happens next</div>
      <div style="font-size:14px;line-height:1.7;color:${BRAND.gray};">${deliveryCopy} Purchased gift-card value does not expire and has no inactivity fee.</div>
    </div>

    <p style="margin:0;font-size:13px;line-height:1.7;color:${BRAND.gray};">Questions? Reply to this email and our team will help.</p>
  `, `${amount} gift card request for ${input.recipientName}. Send payment by ${methodLabel} and include ${input.reference}.`);
}


export function buildGiftCardActivatedEmail(input: {
  recipientName: string;
  purchaserName: string;
  amount: number;
  code: string;
  message?: string | null;
  deliveredToPurchaser?: boolean;
}) {
  const recipientFirst = escapeHtml(input.recipientName.trim().split(/\s+/)[0] || input.recipientName || "there");
  const purchaser = escapeHtml(input.purchaserName);
  const amount = formatMoney(input.amount);
  const code = escapeHtml(input.code);
  const note = input.message?.trim()
    ? `<div style="margin:0 0 22px;padding:18px 20px;border-left:4px solid ${BRAND.coral};background:#faf8f4;font-size:15px;line-height:1.65;color:${BRAND.black};"><div style="margin-bottom:6px;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${BRAND.gray};font-weight:800;">A note from ${purchaser}</div>${escapeHtml(input.message.trim())}</div>`
    : "";

  const intro = input.deliveredToPurchaser
    ? `Your ${amount} Every Detail gift card is active and ready to give. Keep the code below, or forward this email when you are ready.`
    : `${purchaser} sent you ${amount} toward an Every Detail service. No account is required. Just keep the code below and use it when you book or at checkout.`;
  const headline = input.deliveredToPurchaser ? `${recipientFirst}, your gift card is ready.` : `${recipientFirst}, this one’s for you.`;

  return shell(`
    <div style="font-size:11px;line-height:1.2;letter-spacing:1.8px;text-transform:uppercase;color:${BRAND.coral};font-weight:800;">Your Every Detail gift card</div>
    <h1 style="margin:10px 0 12px;font-size:36px;line-height:0.98;letter-spacing:-1.4px;color:${BRAND.black};">${headline}</h1>
    <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:${BRAND.gray};">${intro}</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;">
      <tr><td>
        <div style="padding:26px;border-radius:22px;background:${BRAND.oxblood};color:#ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="font-size:11px;letter-spacing:2px;font-weight:800;">EVERY DETAIL</td>
              <td align="right" style="font-size:12px;font-weight:800;">GIFT CARD</td>
            </tr>
            <tr><td colspan="2" style="padding:24px 0 30px;font-size:42px;line-height:.9;font-weight:900;letter-spacing:-2px;">A better kind<br>of clean.</td></tr>
            <tr>
              <td style="font-size:11px;letter-spacing:1.6px;">MOBILE DETAILING · DECATUR + ATLANTA</td>
              <td align="right"><span style="display:inline-block;width:34px;height:34px;line-height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.7);text-align:center;font-size:14px;font-weight:800;">ED</span></td>
            </tr>
          </table>
        </div>
      </td></tr>
    </table>

    ${note}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 22px;border:1px solid #dedbd5;border-radius:18px;overflow:hidden;background:#faf8f4;">
      <tr><td style="padding:18px 20px 10px;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:${BRAND.black};font-weight:800;">Your card</td></tr>
      <tr><td style="padding:0 20px 18px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${detailRow('Value', amount)}
          ${detailRow('Gift card code', code)}
          ${detailRow('Expiration', 'None')}
        </table>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 18px;"><tr>
      <td style="padding-right:6px;"><a href="https://www.everydetail.co/book" style="display:block;padding:13px 16px;background:${BRAND.coral};border:1px solid ${BRAND.black};box-shadow:3px 3px 0 ${BRAND.black};color:#ffffff;text-decoration:none;text-align:center;font-weight:900;">Book your detail ↗</a></td>
      <td style="padding-left:6px;"><a href="https://www.everydetail.co/account" style="display:block;padding:12px 16px;background:${BRAND.cream};border:1px solid ${BRAND.black};box-shadow:3px 3px 0 ${BRAND.black};color:${BRAND.black};text-decoration:none;text-align:center;font-weight:900;">View account ↗</a></td>
    </tr></table>

    <p style="margin:0;font-size:13px;line-height:1.7;color:${BRAND.gray};">If you use only part of the card, the remaining balance stays available for a future visit.</p>
  `, `${purchaser} sent you a ${amount} Every Detail gift card. Your code is ${input.code}.`);
}

export function buildGiftCardSentConfirmationEmail(input: {
  purchaserName: string;
  recipientName: string;
  recipientEmail: string;
  amount: number;
  code: string;
}) {
  const first = escapeHtml(input.purchaserName.trim().split(/\s+/)[0] || input.purchaserName || "there");
  const recipient = escapeHtml(input.recipientName);
  const recipientEmail = escapeHtml(input.recipientEmail);
  const amount = formatMoney(input.amount);
  const code = escapeHtml(input.code);
  return shell(`
    <div style="font-size:11px;line-height:1.2;letter-spacing:1.8px;text-transform:uppercase;color:${BRAND.coral};font-weight:800;">Gift sent</div>
    <h1 style="margin:10px 0 12px;font-size:34px;line-height:.98;letter-spacing:-1.2px;">It’s on the way.</h1>
    <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:${BRAND.gray};">${first}, your ${amount} Every Detail gift card was activated and sent to ${recipient} at <strong style="color:${BRAND.black};">${recipientEmail}</strong>.</p>
    <div style="padding:18px 20px;border-radius:18px;background:#faf8f4;border:1px solid #dedbd5;">
      <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND.gray};font-weight:800;">Gift card code</div>
      <div style="margin-top:5px;font-size:22px;font-weight:900;letter-spacing:1px;color:${BRAND.black};">${code}</div>
    </div>
  `, `Your ${amount} gift card for ${input.recipientName} has been sent.`);
}

export async function sendEmail(message: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[email] RESEND_API_KEY not configured:", {
        to: message.to,
        subject: message.subject,
      });
    }

    return {
      ok: false,
      skipped: true,
    };
  }

  const from =
    process.env.RESEND_FROM_EMAIL ||
    "Every Detail <hello@everydetail.co>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(message.to) ? message.to : [message.to],
      subject: message.subject,
      html: message.html,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      ...(message.attachments?.length ? { attachments: message.attachments } : {}),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend responded ${response.status}: ${body}`);
  }

  const responseBody = await response.json().catch(() => ({})) as { id?: string };

  return {
    ok: true,
    id: responseBody.id || null,
  };
}

export type AfterJobEmail = {
  name: string;
  email: string;
  vehicle: string;
  service: string;
  completedAt: string;
  total: number;
  receiptNumber: string;
  lines: Array<{ label: string; amount: number }>;
  beforeUrl?: string | null;
  afterUrl?: string | null;
  includeReceipt: boolean;
  includeReview: boolean;
  includeDetailPlus: boolean;
};

function afterJobPhotoSplit(beforeUrl?: string | null, afterUrl?: string | null) {
  if (!beforeUrl || !afterUrl) return "";
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;table-layout:fixed;">
      <tr>
        <td colspan="2" style="padding:0 0 12px;font-size:11px;line-height:1.2;letter-spacing:1.8px;text-transform:uppercase;color:#111111;font-weight:700;">01 / THE TRANSFORMATION</td>
      </tr>
      <tr>
        <td width="50%" style="padding:0 5px 0 0;vertical-align:top;">
          <div style="padding:0 0 7px;font-size:10px;letter-spacing:1.4px;color:#666666;font-weight:700;">BEFORE</div>
          <img src="${escapeHtml(beforeUrl)}" alt="Before detail" width="100%" style="display:block;width:100%;height:auto;border:0;border-radius:3px;">
        </td>
        <td width="50%" style="padding:0 0 0 5px;vertical-align:top;">
          <div style="padding:0 0 7px;font-size:10px;letter-spacing:1.4px;color:#666666;font-weight:700;">AFTER</div>
          <img src="${escapeHtml(afterUrl)}" alt="After detail" width="100%" style="display:block;width:100%;height:auto;border:0;border-radius:3px;">
        </td>
      </tr>
    </table>`;
}

function afterJobShell(content: string, preheader = "") {
  return `
<!doctype html>
<html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Every Detail</title></head>
  <body style="margin:0;padding:0;background:${BRAND.cream};font-family:Arial,Helvetica,sans-serif;color:${BRAND.black};">
    <div style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;color:transparent;">${escapeHtml(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.cream};">
      <tr><td align="center" style="padding:24px 12px 34px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:680px;">
          <tr><td style="padding:14px 4px 18px;border-bottom:1px solid rgba(17,17,17,.16);">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
              <td style="font-size:12px;letter-spacing:2.1px;font-weight:900;color:${BRAND.oxblood};">EVERY DETAIL</td>
              <td align="right" style="font-size:10px;letter-spacing:1.3px;font-weight:700;color:${BRAND.gray};">DECATUR + ATLANTA</td>
            </tr></table>
          </td></tr>
          <tr><td style="height:28px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
          ${content}
          <tr><td style="padding:14px 4px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.oxblood};"><tr><td style="padding:24px 26px;color:${BRAND.cream};">
              <div style="font-size:11px;letter-spacing:1.6px;font-weight:900;">EVERY DETAIL</div>
              <div style="margin-top:7px;font-size:12px;line-height:1.65;color:#efe7df;">Mobile detailing, brought to your driveway. Questions? Reply directly to this email.</div>
            </td></tr></table>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export async function sendAfterJobEmail(input: AfterJobEmail, receiptBase64?: string) {
  const firstName = input.name.trim().split(/\s+/)[0] || input.name || "there";
  const completed = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "long", day: "numeric", year: "numeric" }).format(new Date(input.completedAt));
  const reviewUrl = process.env.GOOGLE_REVIEW_URL || "https://www.google.com/search?q=Every+Detail+Mobile+Detailing#lrd=0x8e30f21fe0cce555:0x394893f8064359ae,1,,,,";
  const detailPlusUrl = process.env.DETAIL_PLUS_URL || "https://www.everydetail.co/detailplus";
  const bookUrl = process.env.BOOKING_URL || "https://www.everydetail.co/book";

  const reviewModule = input.includeReview ? `
    <tr><td style="padding:0 4px 14px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border:1px solid rgba(17,17,17,.14);border-radius:12px;">
        <tr><td style="padding:25px 26px;">
          <div style="font-size:10px;letter-spacing:1.7px;text-transform:uppercase;color:#b8363d;font-weight:800;">03 / HOW DID WE DO?</div>
          <div style="margin:8px 0 7px;font-size:23px;line-height:1.15;font-weight:700;letter-spacing:-.5px;">Love how it turned out?</div>
          <div style="font-size:14px;line-height:1.6;color:#666666;">A Google review is one of the best ways to support our small team.</div>
          <div style="margin-top:18px;"><a href="${escapeHtml(reviewUrl)}" style="display:inline-block;background:#b8363d;color:#ffffff;text-decoration:none;padding:12px 18px;border:1px solid #111111;box-shadow:3px 3px 0 #111111;font-size:13px;font-weight:900;">Leave a review ↗</a></div>
        </td></tr>
      </table>
    </td></tr>` : "";

  const detailPlusModule = input.includeDetailPlus ? `
    <tr><td style="padding:0 4px 14px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#590d07;border-radius:12px;">
        <tr><td style="padding:26px;">
          <div style="font-size:10px;letter-spacing:1.7px;text-transform:uppercase;color:#dbc7b3;font-weight:800;">DETAIL+</div>
          <div style="margin:8px 0 8px;font-size:25px;line-height:1.1;font-weight:700;letter-spacing:-.6px;color:#ffffff;">Keep it at its best.</div>
          <div style="font-size:14px;line-height:1.6;color:#f3f1ec;">Recurring maintenance that keeps your vehicle from getting back to square one.</div>
          <div style="margin-top:16px;"><a href="${escapeHtml(detailPlusUrl)}" style="color:#ffffff;font-size:13px;font-weight:700;text-decoration:underline;text-decoration-color:#b8363d;text-underline-offset:4px;">Explore Detail+ ↗</a></div>
        </td></tr>
      </table>
    </td></tr>` : "";

  const receiptModule = input.includeReceipt ? `
    <tr><td style="padding:5px 4px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid rgba(17,17,17,.14);">
        <tr>
          <td style="padding:18px 0;font-size:12px;line-height:1.5;color:#666666;">RECEIPT <strong style="color:#111111;">${escapeHtml(input.receiptNumber)}</strong><br>Attached as a PDF for your records.</td>
          <td align="right" style="padding:18px 0;font-size:24px;line-height:1;font-weight:700;color:#111111;">${formatMoney(input.total)}</td>
        </tr>
      </table>
    </td></tr>` : "";

  const html = afterJobShell(`
    <tr><td style="background:#590d07;border-radius:16px;padding:36px 30px 34px;">
      <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#dbc7b3;font-weight:800;">DETAIL COMPLETE / ${escapeHtml(completed)}</div>
      <div style="margin-top:16px;font-size:38px;line-height:1.02;font-weight:700;letter-spacing:-1.6px;color:#ffffff;">${escapeHtml(firstName)}, your car.<br>Back to its best.</div>
      <div style="margin-top:17px;font-size:14px;line-height:1.5;color:#f3f1ec;">${escapeHtml(input.vehicle)} · ${escapeHtml(input.service)}</div>
    </td></tr>

    <tr><td style="padding:30px 4px 14px;">${afterJobPhotoSplit(input.beforeUrl, input.afterUrl)}
      <div style="margin-top:22px;font-size:20px;font-weight:700;letter-spacing:-.3px;">${escapeHtml(input.vehicle)}</div>
      <div style="margin-top:4px;font-size:13px;color:#666666;">${escapeHtml(input.service)} · completed ${escapeHtml(completed)}</div>
      <p style="margin:14px 0 0;font-size:15px;line-height:1.65;color:#4f4c49;">Thanks for trusting us with it. The detail is finished, the vehicle is ready, and we’ve attached the receipt if one was requested.</p>
    </td></tr>

    <tr><td style="padding:0 4px 14px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ebe6dd;border-radius:12px;">
        <tr><td style="padding:25px 26px;">
          <div style="font-size:10px;letter-spacing:1.7px;text-transform:uppercase;color:#590d07;font-weight:800;">02 / KEEP IT LOOKING THIS GOOD</div>
          <div style="margin:8px 0 7px;font-size:23px;line-height:1.15;font-weight:700;letter-spacing:-.5px;">Maintenance beats starting over.</div>
          <div style="font-size:14px;line-height:1.6;color:#55514d;">When it’s time for the next detail, we’ll bring everything back to your driveway.</div>
          <div style="margin-top:17px;"><a href="${escapeHtml(bookUrl)}" style="display:inline-block;color:#590d07;font-size:13px;font-weight:700;text-decoration:underline;text-decoration-color:#b8363d;text-underline-offset:4px;">Book your next detail ↗</a></div>
        </td></tr>
      </table>
    </td></tr>
    ${reviewModule}
    ${detailPlusModule}
    ${receiptModule}
  `, `Your ${input.service} is complete. See the transformation inside.`);

  return sendEmail({
    to: input.email,
    subject: `Your ${input.vehicle} is all set`,
    html,
    replyTo: process.env.INTERNAL_NOTIFY_EMAIL || "hello@everydetail.co",
    attachments: input.includeReceipt && receiptBase64 ? [{ filename: `${input.receiptNumber}.pdf`, content: receiptBase64 }] : undefined,
  });
}

export async function sendBookingEmails(booking: BookingEmail) {
  const appointment = formatAppointment(booking.start);
  const money = formatMoney(booking.price);
  const firstName = firstNameOnly(booking.name);
  const lines = booking.lines?.length
    ? booking.lines
    : [{ vehicle: booking.vehicle, service: booking.service, price: booking.price }];
  const vehicleRows = lines
    .map((line, index) =>
      detailRow(
        lines.length > 1 ? `Vehicle ${index + 1}` : "Vehicle",
        `${line.vehicle} · ${line.service} · ${formatMoney(line.price)}`,
      ),
    )
    .join("");

  const customerHtml = shell(
    `
      ${eyebrow("You’re booked")}
      ${headline(`${firstName ? `${escapeHtml(firstName)}, you’re` : "You’re"} on the schedule.`)}
      ${lede(`Your Every Detail appointment is confirmed. We’ll bring the equipment, products, power, and water. You just give us access to ${lines.length > 1 ? "the vehicles" : "the vehicle"}.`)}

      ${detailPanel(`
        ${detailRow("When", appointment)}
        ${vehicleRows}
        ${detailRow("Where", booking.address)}
        ${detailRow("Total", money)}
      `, "Your appointment")}

      ${noteBlock(
        "Nothing else to do right now.",
        `We’ll send you a reminder before the appointment and a same-day confirmation once your team is assigned. If anything changes, just reply to this email.`,
      )}
    `,
    `${booking.service} confirmed for ${appointment}`,
  );

  const internalHtml = shell(
    `
      ${eyebrow("New website booking")}
      ${headline(escapeHtml(booking.service))}
      ${detailPanel(`
        ${detailRow("Customer", booking.name)}
        ${detailRow("Phone", booking.phone)}
        ${detailRow("Email", booking.email)}
        ${vehicleRows}
        ${detailRow("When", appointment)}
        ${detailRow("Address", booking.address)}
        ${detailRow("Total", money)}
        ${booking.leadSource ? detailRow("Heard about us", `${booking.leadSource}${booking.leadSourceDetail ? ` · ${booking.leadSourceDetail}` : ""}`) : ""}
        ${booking.notes ? detailRow("Notes", booking.notes) : ""}
      `, "Booking details")}
    `,
    `New booking: ${booking.service}`,
  );

  const [customer, internal] = await Promise.allSettled([
    sendEmail({
      to: booking.email,
      subject: `You’re booked with Every Detail`,
      html: customerHtml,
      replyTo: process.env.INTERNAL_NOTIFY_EMAIL || "hello@everydetail.co",
    }),
    sendEmail({
      to: process.env.INTERNAL_NOTIFY_EMAIL || "hello@everydetail.co",
      subject: `New booking · ${booking.service} · ${booking.name}`,
      html: internalHtml,
      replyTo: booking.email,
    }),
  ]);

  if (customer.status === "rejected") console.error("[email] customer booking confirmation failed", customer.reason);
  if (internal.status === "rejected") console.error("[email] internal booking notification failed", internal.reason);

  const sent = (result: PromiseSettledResult<{ ok: boolean; skipped?: boolean }>) =>
    result.status === "fulfilled" && result.value.ok === true;

  return {
    customerSent: sent(customer),
    internalSent: sent(internal),
  };
}

function leadTitle(type: string) {
  if (type === "quote") return "Quote request";
  if (type === "detailplus") return "Detail+ request";
  if (type === "booking") return "Booking request";
  return "Website request";
}

function fieldLabel(key: string) {
  const labels: Record<string, string> = {
    name: "Name",
    phone: "Phone",
    email: "Email",
    vehicle: "Vehicle",
    vehicleYear: "Vehicle year",
    vehicleMake: "Vehicle make",
    vehicleModel: "Vehicle model",
    vehicleSize: "Vehicle size",
    interest: "Interested in",
    service: "Recommended service",
    addons: "Add-ons",
    quoteDisplay: "Estimated total",
    internalNotes: "Build details",
    source: "Source",
    frequency: "Frequency",
    coverage: "Coverage",
    address: "Address",
    preferredDays: "Preferred days",
    notes: "Notes",
    message: "Message",
    page: "Page",
  };

  return labels[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

export async function sendLeadEmails({ type, fields }: LeadEmail) {
  const title = leadTitle(type);
  const customerEmail = fields.email || "";
  const firstName = firstNameOnly(fields.name || "");

  const rows = Object.entries(fields)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => detailRow(fieldLabel(key), value))
    .join("");

  const internalHtml = shell(
    `
      ${eyebrow("New website request")}
      ${headline(escapeHtml(title))}
      ${detailPanel(rows, "Request details")}
    `,
    `${title} from ${fields.name || "a website visitor"}`,
  );

  const jobs: Promise<unknown>[] = [
    sendEmail({
      to: process.env.INTERNAL_NOTIFY_EMAIL || "hello@everydetail.co",
      subject: `${title} · ${fields.name || "Website"}`,
      html: internalHtml,
      replyTo: customerEmail || undefined,
    }),
  ];

  if (customerEmail) {
    const isDetailPlus = type === "detailplus";
    const isQuote = type === "quote";
    const eyebrowCopy = isDetailPlus ? "Detail+" : isQuote ? "Request received" : "We got it";
    const headlineCopy = isDetailPlus
      ? `${firstName ? `${escapeHtml(firstName)}, we’ve` : "We’ve"} got your Detail+ request.`
      : isQuote
        ? `${firstName ? `${escapeHtml(firstName)}, we’ve` : "We’ve"} got your request.`
        : `${firstName ? `${escapeHtml(firstName)}, we’ve` : "We’ve"} got it.`;
    const bodyCopy = isDetailPlus
      ? "We’ll look over your vehicle and coverage preferences, then follow up with the best maintenance setup for you."
      : isQuote
        ? "We’ll review what you sent and follow up with the best next step for your vehicle."
        : "Your request made it to the Every Detail team. We’ll review the details and follow up directly.";

    const customerHtml = shell(
      `
        ${eyebrow(eyebrowCopy)}
        ${headline(headlineCopy)}
        ${lede(bodyCopy)}
        ${noteBlock("Need to add something?", "Reply to this email and it’ll land with the same team reviewing your request.")}
      `,
      "Your request made it to Every Detail",
    );

    jobs.push(
      sendEmail({
        to: customerEmail,
        subject: isDetailPlus ? "We got your Detail+ request" : "We got your request · Every Detail",
        html: customerHtml,
        replyTo: process.env.INTERNAL_NOTIFY_EMAIL || "hello@everydetail.co",
      }),
    );
  }

  const results = await Promise.allSettled(jobs);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[email] lead email failed", result.reason);
    }
  }
}

export type JobReminderEmail = {
  name: string;
  email: string;
  address: string;
  service: string;
  vehicle: string;
  start: string;
};

export type DayOfTeamMember = {
  name: string;
  isLead?: boolean;
};

export type DayOfJobConfirmationEmail = JobReminderEmail & {
  team: DayOfTeamMember[];
};

function formatAppointmentTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function firstNameOnly(value: string) {
  return value.trim().split(/\s+/)[0] || value.trim();
}

function initials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "ED";
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() || "").join("") || "ED";
}

function teamMemberCard(member: DayOfTeamMember) {
  const name = firstNameOnly(member.name) || "Every Detail";
  const role = member.isLead ? "Lead detailer" : "Detailer";

  return `
    <tr>
      <td style="padding:0 0 9px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border:1px solid rgba(17,17,17,.14);">
          <tr>
            <td width="66" style="padding:13px 0 13px 14px;vertical-align:middle;">
              <div style="width:46px;height:46px;border-radius:999px;background:${BRAND.oxblood};color:${BRAND.cream};text-align:center;line-height:46px;font-size:13px;font-weight:900;letter-spacing:.8px;">${escapeHtml(initials(member.name))}</div>
            </td>
            <td style="padding:13px 16px;vertical-align:middle;">
              <div style="font-size:16px;line-height:1.2;color:${BRAND.black};font-weight:900;">${escapeHtml(name)}</div>
              <div style="margin-top:3px;font-size:11px;line-height:1.3;letter-spacing:.7px;text-transform:uppercase;color:${BRAND.gray};font-weight:700;">${role}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/** Send the personal same-day confirmation after the job crew has been assigned. */
export async function sendDayOfJobConfirmationEmail(booking: DayOfJobConfirmationEmail) {
  const appointment = formatAppointment(booking.start);
  const appointmentTime = formatAppointmentTime(booking.start);
  const firstName = firstNameOnly(booking.name);
  const team = booking.team.filter((member) => member.name.trim());
  const teamRows = team.map(teamMemberCard).join("");
  const teamLabel = team.length === 1 ? "Your detailer today" : "Your team today";

  const html = shell(
    `
      ${eyebrow("Today with Every Detail")}
      ${headline(`We’ll see you today${firstName ? `, ${escapeHtml(firstName)}` : ""}.`)}
      ${lede(`Your car’s on our board and your team is ready. We’ll be there around <strong style="color:${BRAND.black};">${escapeHtml(appointmentTime)}</strong>.`)}

      ${teamRows ? `
        <div style="margin:0 0 10px;font-size:10px;line-height:1.2;letter-spacing:1.7px;text-transform:uppercase;color:${BRAND.oxblood};font-weight:900;">${teamLabel}</div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px;">${teamRows}</table>
      ` : ""}

      ${detailPanel(`
        ${detailRow("Time", appointmentTime)}
        ${detailRow("Service", booking.service)}
        ${detailRow("Vehicle", booking.vehicle)}
        ${detailRow("Location", booking.address)}
      `, "Today’s appointment")}

      ${noteBlock(
        "No need to confirm anything.",
        "We’ve got it from here. Just make sure we can access the vehicle at the scheduled time. We bring our own power and water. If anything changes, reply to this email.",
      )}
    `,
    `We’re all set for your ${appointmentTime} Every Detail appointment today.`,
  );

  return sendEmail({
    to: booking.email,
    subject: `We’ll see you today${firstName ? `, ${firstName}` : ""}`,
    html,
    replyTo: process.env.INTERNAL_NOTIFY_EMAIL || "hello@everydetail.co",
  });
}

/** Send the single customer reminder used roughly 24 hours before a job. */
export async function sendJobReminderEmail(booking: JobReminderEmail) {
  const appointment = formatAppointment(booking.start);
  const firstName = firstNameOnly(booking.name);

  const html = shell(
    `
      ${eyebrow("Tomorrow with Every Detail")}
      ${headline(`Tomorrow’s the day${firstName ? `, ${escapeHtml(firstName)}` : ""}.`)}
      ${lede("Your appointment is on the schedule. Here’s everything you need to know before we arrive.")}

      ${detailPanel(`
        ${detailRow("When", appointment)}
        ${detailRow("Service", booking.service)}
        ${detailRow("Vehicle", booking.vehicle)}
        ${detailRow("Where", booking.address)}
      `, "Your appointment")}

      ${noteBlock(
        "We bring the setup.",
        "Power, water, equipment, and products are on us. Just make sure we can access the vehicle at the scheduled time. If anything has changed, reply to this email and we’ll help.",
      )}
    `,
    `Your Every Detail appointment is ${appointment}`,
  );

  return sendEmail({
    to: booking.email,
    subject: `We’ll see you tomorrow${firstName ? `, ${firstName}` : ""}`,
    html,
    replyTo: process.env.INTERNAL_NOTIFY_EMAIL || "hello@everydetail.co",
  });
}
