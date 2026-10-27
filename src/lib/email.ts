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

function appointmentTicket(input: { kicker: string; date: string; service: string; vehicle: string; address: string; total?: string }) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;border-top:2px solid ${BRAND.black};border-bottom:1px solid rgba(17,17,17,.22);">
      <tr><td style="padding:16px 0 8px;font-size:10px;line-height:1.2;letter-spacing:1.7px;text-transform:uppercase;color:${BRAND.oxblood};font-weight:900;">${escapeHtml(input.kicker)}</td></tr>
      <tr><td style="padding:0 0 18px;font-size:27px;line-height:1.08;letter-spacing:-.7px;font-weight:900;color:${BRAND.black};">${escapeHtml(input.date)}</td></tr>
      <tr><td style="padding:0 0 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${detailRow("Service", input.service)}
          ${detailRow("Vehicle", input.vehicle)}
          ${detailRow("Location", input.address)}
          ${input.total ? detailRow("Total", input.total) : ""}
        </table>
      </td></tr>
    </table>
  `;
}

function checklistRow(number: string, title: string, body: string) {
  return `
    <tr>
      <td width="42" valign="top" style="padding:16px 0;border-top:1px solid rgba(17,17,17,.16);font-size:11px;line-height:1.4;color:${BRAND.oxblood};font-weight:900;">${escapeHtml(number)}</td>
      <td valign="top" style="padding:16px 0;border-top:1px solid rgba(17,17,17,.16);">
        <div style="font-size:14px;line-height:1.35;color:${BRAND.black};font-weight:900;">${escapeHtml(title)}</div>
        <div style="margin-top:4px;font-size:13px;line-height:1.55;color:${BRAND.gray};">${body}</div>
      </td>
    </tr>
  `;
}

function actionButton(label: string, href: string, secondary = false) {
  const background = secondary ? BRAND.cream : BRAND.coral;
  const color = secondary ? BRAND.black : "#ffffff";
  return `<a href="${escapeHtml(href)}" style="display:block;padding:13px 16px;background:${background};border:1px solid ${BRAND.black};box-shadow:3px 3px 0 ${BRAND.black};color:${color};text-decoration:none;text-align:center;font-weight:900;">${escapeHtml(label)} ↗</a>`;
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
  const deliveryCopy = input.deliveryMode === "recipient"
    ? "Once payment is confirmed, we’ll send the active card straight to the recipient."
    : "Once payment is confirmed, we’ll send the active card back to you so you can give it yourself.";

  return shell(`
    ${eyebrow("Gift card / almost ready")}
    ${headline(`${purchaserFirst}, one last step.`)}
    ${lede(`We’ve reserved <strong style="color:${BRAND.black};">${amount}</strong> for ${recipient}. Send the payment with the reference below and we’ll activate the card.`)}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:2px 0 28px;background:${BRAND.oxblood};color:#ffffff;">
      <tr><td style="padding:25px 25px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr><td style="font-size:10px;letter-spacing:2px;font-weight:900;">EVERY DETAIL</td><td align="right" style="font-size:10px;letter-spacing:1.5px;font-weight:800;">GIFT CARD</td></tr>
          <tr><td colspan="2" style="padding:25px 0 28px;font-size:41px;line-height:.92;font-weight:900;letter-spacing:-1.8px;">${amount}<br><span style="color:${BRAND.beige};font-size:18px;letter-spacing:-.4px;">for ${recipient}</span></td></tr>
          <tr><td colspan="2" style="font-size:10px;line-height:1.5;letter-spacing:1.5px;color:#efe7df;">MOBILE DETAILING · DECATUR + ATLANTA</td></tr>
        </table>
      </td></tr>
    </table>

    <div style="margin:0 0 8px;font-size:10px;line-height:1.2;letter-spacing:1.7px;text-transform:uppercase;color:${BRAND.oxblood};font-weight:900;">Payment details</div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 22px;border-top:2px solid ${BRAND.black};border-bottom:1px solid rgba(17,17,17,.2);">
      ${detailRow("Amount", amount)}
      ${detailRow("Reference", input.reference)}
      ${detailRow("Method", methodLabel)}
      ${detailRow("Send to", target)}
    </table>

    ${input.paymentMethod === "venmo" && input.paymentUrl ? `<div style="margin:0 0 25px;">${actionButton("Open Venmo", input.paymentUrl)}</div>` : ""}

    ${noteBlock("Then you’re done.", `${deliveryCopy} Purchased gift-card value does not expire and has no inactivity fee.`)}
  `, `${amount} gift card for ${input.recipientName}. Use reference ${input.reference} when you send payment.`);
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
  const intro = input.deliveredToPurchaser
    ? `Your ${amount} Every Detail gift card is active and ready to give.`
    : `${purchaser} sent you ${amount} toward an Every Detail service.`;
  const title = input.deliveredToPurchaser ? `${recipientFirst}, it’s ready to give.` : `${recipientFirst}, this one’s for you.`;
  const note = input.message?.trim()
    ? `<div style="margin:0 0 24px;padding:16px 0 16px 18px;border-left:3px solid ${BRAND.coral};font-size:15px;line-height:1.65;color:${BRAND.black};"><div style="margin-bottom:6px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND.gray};font-weight:900;">A note from ${purchaser}</div>${escapeHtml(input.message.trim())}</div>`
    : "";

  return shell(`
    ${eyebrow("Every Detail gift card")}
    ${headline(title)}
    ${lede(`${intro} No account is required. Keep the code below and use it when you book.`)}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:2px 0 26px;background:${BRAND.oxblood};color:#ffffff;">
      <tr><td style="padding:27px 25px 30px;">
        <div style="font-size:10px;letter-spacing:2px;font-weight:900;">EVERY DETAIL / GIFT CARD</div>
        <div style="padding:26px 0 10px;font-size:44px;line-height:.92;font-weight:900;letter-spacing:-2px;">${amount}</div>
        <div style="font-size:11px;letter-spacing:1.4px;color:${BRAND.beige};">CODE&nbsp;&nbsp;${code}</div>
      </td></tr>
    </table>

    ${note}

    <div style="margin:0 0 12px;">${actionButton("Book your detail", "https://www.everydetail.co/book")}</div>
    <div style="margin:0 0 22px;">${actionButton("View account", "https://www.everydetail.co/account", true)}</div>

    <p style="margin:0;font-size:13px;line-height:1.7;color:${BRAND.gray};">Use part or all of the balance. Anything left stays available for a future visit. No expiration and no inactivity fee.</p>
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
    ${eyebrow("Gift delivered")}
    ${headline(`${first}, it’s on the way.`)}
    ${lede(`Your <strong style="color:${BRAND.black};">${amount}</strong> Every Detail gift card was activated and sent to ${recipient}.`)}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 23px;border-top:2px solid ${BRAND.black};border-bottom:1px solid rgba(17,17,17,.2);">
      ${detailRow("Recipient", recipient)}
      ${detailRow("Delivered to", recipientEmail)}
      ${detailRow("Gift card code", code)}
    </table>

    ${noteBlock("You’re all set.", "We sent the active card directly to them. Keep this email for your records, and reply here if anything looks off.")}
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
          <div style="margin:8px 0 8px;font-size:25px;line-height:1.1;font-weight:700;letter-spacing:-.6px;color:#ffffff;">Want us to keep up with it?</div>
          <div style="font-size:14px;line-height:1.6;color:#f3f1ec;">Detail+ is the simple option for cleaner cars that just need regular upkeep, not another reset.</div>
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
          <div style="font-size:10px;letter-spacing:1.7px;text-transform:uppercase;color:#590d07;font-weight:800;">02 / KEEP THE CLEAN GOING</div>
          <div style="margin:8px 0 7px;font-size:23px;line-height:1.15;font-weight:700;letter-spacing:-.5px;">Life’s good in a clean car.</div>
          <div style="font-size:14px;line-height:1.6;color:#55514d;">When it starts feeling lived-in again, we’ll bring the clean back to your driveway.</div>
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
  const vehicleSummary = lines.map((line) => `${line.vehicle} · ${line.service}`).join(" / ");
  const lineRows = lines.map((line, index) => detailRow(lines.length > 1 ? `Vehicle ${index + 1}` : "Vehicle", `${line.vehicle} · ${line.service} · ${formatMoney(line.price)}`)).join("");

  const customerHtml = shell(
    `
      ${eyebrow("Confirmed / Every Detail")}
      ${headline(`${firstName ? `${escapeHtml(firstName)}, you’re` : "You’re"} on the schedule.`)}
      ${lede("Your appointment is locked in. We’ll bring the setup and take it from there.")}

      ${appointmentTicket({
        kicker: "Your appointment",
        date: appointment,
        service: lines.length > 1 ? `${lines.length} vehicles` : booking.service,
        vehicle: vehicleSummary,
        address: booking.address,
        total: money,
      })}

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 22px;">
        ${checklistRow("01", "You’re booked", "No deposit confirmation or extra form is needed right now.")}
        ${checklistRow("02", "We’ll remind you", "You’ll get a practical reminder before the appointment.")}
        ${checklistRow("03", "Meet your team", "On the day of the detail, we’ll send your assigned crew once they’re set.")}
      </table>

      ${noteBlock("Plans change?", "Reply to this email and we’ll help. If your appointment is formally rescheduled or cancelled, we’ll send an updated confirmation automatically.")}
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
        ${lineRows}
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
    coverage: "Tasks",
    frequencyId: "Frequency id",
    taskIds: "Task ids",
    vehicleId: "Vehicle size",
    quotedPerVisit: "Quoted per visit",
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
    const vehicle = fields.vehicle || [fields.vehicleYear, fields.vehicleMake, fields.vehicleModel].filter(Boolean).join(" ") || "Your vehicle";
    const requestedService = fields.service || fields.interest || "We’ll help choose the right service";

    let customerHtml: string;
    let customerSubject: string;

    if (isQuote) {
      const quoteRows = [
        detailRow("Vehicle", vehicle),
        detailRow("Looking for", requestedService),
        fields.addons ? detailRow("Selected extras", fields.addons) : "",
        fields.quoteDisplay ? detailRow("Submitted estimate", fields.quoteDisplay) : "",
        fields.desiredTiming ? detailRow("Timing", fields.desiredTiming.replaceAll("_", " ")) : "",
      ].join("");

      customerHtml = shell(
        `
          ${eyebrow("Your build / received")}
          ${headline(`${firstName ? `${escapeHtml(firstName)}, we saved` : "We saved"} your build.`)}
          ${lede("We’ve got the vehicle and service choices you sent. We’ll review the build and reach out personally if anything needs adjusting before you book.")}

          ${detailPanel(quoteRows, "What you sent us")}

          ${fields.message ? `<div style="margin:0 0 22px;padding:0 0 0 17px;border-left:3px solid ${BRAND.coral};font-size:13px;line-height:1.65;color:${BRAND.gray};"><strong style="display:block;color:${BRAND.black};margin-bottom:4px;">Vehicle notes</strong>${escapeHtml(fields.message)}</div>` : ""}

          ${noteBlock("What happens next", "A real person on the Every Detail team will look it over. If the build already makes sense, we’ll help you move straight into scheduling. Reply here if you forgot anything.")}
        `,
        `Your Every Detail build is saved for ${vehicle}`,
      );
      customerSubject = `We saved your Every Detail build`;
    } else if (isDetailPlus) {
      const planRows = [
        detailRow("Vehicle", vehicle),
        detailRow("Rhythm", fields.frequency || "Your selected schedule"),
        detailRow("What gets cleaned", fields.coverage || "Your selected tasks"),
        fields.quotedPerVisit ? detailRow("Your rate", `$${fields.quotedPerVisit} per visit, flat`) : "",
      ].join("");

      customerHtml = shell(
        `
          ${eyebrow("Detail+ / plan received")}
          ${headline(`${firstName ? `${escapeHtml(firstName)}, your` : "Your"} routine is with us.`)}
          ${lede("You built the plan and saw the price. We’ll confirm the details and set up your first visit.")}

          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;background:${BRAND.oxblood};color:#ffffff;">
            <tr><td style="padding:24px 24px 12px;font-size:10px;line-height:1.2;letter-spacing:1.8px;color:${BRAND.beige};font-weight:900;">DETAIL+ / PLAN PREVIEW</td></tr>
            <tr><td style="padding:0 24px 22px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="color:#ffffff;">${planRows.replaceAll(`color:${BRAND.black}`, "color:#ffffff").replaceAll(`color:${BRAND.gray}`, `color:${BRAND.beige}`).replaceAll("rgba(17,17,17,.12)", "rgba(255,255,255,.18)")}</table></td></tr>
          </table>

          ${noteBlock("Next up", "We’ll confirm your plan and help set the first visit. There’s no contract. If you need to change the vehicle, tasks, or rhythm, reply here.")}
        `,
        `Your Detail+ plan: ${fields.frequency || "maintenance"} · ${vehicle}`,
      );
      customerSubject = `We got your Detail+ plan`;
    } else {
      customerHtml = shell(
        `
          ${eyebrow("We got it")}
          ${headline(`${firstName ? `${escapeHtml(firstName)}, we’ve` : "We’ve"} got your request.`)}
          ${lede("Your request made it to the Every Detail team. We’ll review the details and follow up directly.")}
          ${noteBlock("Need to add something?", "Reply to this email and it’ll land with the same team reviewing your request.")}
        `,
        "Your request made it to Every Detail",
      );
      customerSubject = `We got your request · Every Detail`;
    }

    jobs.push(
      sendEmail({
        to: customerEmail,
        subject: customerSubject,
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

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:18px 0 0;background:#ffffff;border:1px solid rgba(17,17,17,.14);">
        <tr>
          <td style="padding:20px 20px 19px;">
            <div style="font-size:10px;line-height:1.2;letter-spacing:1.7px;text-transform:uppercase;color:${BRAND.oxblood};font-weight:900;">Follow today’s detail</div>
            <div style="margin-top:7px;font-size:19px;line-height:1.15;color:${BRAND.black};font-weight:900;">Booking details + live status.</div>
            <div style="margin-top:8px;font-size:13px;line-height:1.6;color:${BRAND.gray};">Sign in or create your Every Detail account using <strong style="color:${BRAND.black};">${escapeHtml(booking.email)}</strong>, the same email used for this booking. Your account shows the appointment details, assigned crew, and live status changes as the job moves from on the way through final inspection.</div>
            <div style="margin-top:16px;">
              <a href="https://www.everydetail.co/account/sign-in?next=/account" style="display:block;padding:13px 16px;background:${BRAND.red};border:1px solid ${BRAND.black};box-shadow:3px 3px 0 ${BRAND.black};color:#ffffff;text-decoration:none;text-align:center;font-size:13px;line-height:1.2;font-weight:900;">View booking &amp; live status ↗</a>
            </div>
          </td>
        </tr>
      </table>
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
      ${eyebrow("Tomorrow / quick prep")}
      ${headline(`We’re coming tomorrow${firstName ? `, ${escapeHtml(firstName)}` : ""}.`)}
      ${lede("Your appointment is set. There’s very little you need to do before we arrive.")}

      ${appointmentTicket({
        kicker: "Tomorrow’s appointment",
        date: appointment,
        service: booking.service,
        vehicle: booking.vehicle,
        address: booking.address,
      })}

      <div style="margin:0 0 6px;font-size:10px;line-height:1.2;letter-spacing:1.7px;text-transform:uppercase;color:${BRAND.oxblood};font-weight:900;">Before we get there</div>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 22px;">
        ${checklistRow("01", "Make the vehicle accessible", "Have it unlocked or the key available when the team arrives.")}
        ${checklistRow("02", "Give us room to work", "If possible, have the vehicle parked where we can comfortably work around it.")}
        ${checklistRow("03", "That’s basically it", "We bring our own power, water, equipment, and products.")}
      </table>

      ${noteBlock("Something changed?", "Reply to this email. If we formally move the appointment, you’ll receive a fresh confirmation with the new time.")}
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

export type JobChangeEmail = JobReminderEmail & {
  previousStart?: string | null;
};

export async function sendJobRescheduledEmail(booking: JobChangeEmail) {
  const firstName = firstNameOnly(booking.name);
  const newAppointment = formatAppointment(booking.start);
  const oldAppointment = booking.previousStart ? formatAppointment(booking.previousStart) : "Your previous appointment time";

  const html = shell(
    `
      ${eyebrow("Appointment updated")}
      ${headline(`${firstName ? `${escapeHtml(firstName)}, your` : "Your"} new time is set.`)}
      ${lede("Your Every Detail appointment has been moved. This email is your confirmation of the updated schedule.")}

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;border-top:2px solid ${BRAND.black};border-bottom:1px solid rgba(17,17,17,.2);">
        ${detailRow("Was", oldAppointment)}
        ${detailRow("Now", newAppointment)}
        ${detailRow("Service", booking.service)}
        ${detailRow("Vehicle", booking.vehicle)}
        ${detailRow("Location", booking.address)}
      </table>

      ${noteBlock("You’re confirmed for the new time.", "You don’t need to do anything else. We’ll use the updated appointment for future reminders and your day-of team confirmation.")}
    `,
    `Your Every Detail appointment moved to ${newAppointment}`,
  );

  return sendEmail({
    to: booking.email,
    subject: `Your Every Detail appointment has been moved`,
    html,
    replyTo: process.env.INTERNAL_NOTIFY_EMAIL || "hello@everydetail.co",
  });
}

export async function sendJobCancellationEmail(booking: JobChangeEmail) {
  const firstName = firstNameOnly(booking.name);
  const appointment = formatAppointment(booking.start);

  const html = shell(
    `
      ${eyebrow("Appointment cancelled")}
      ${headline(`${firstName ? `${escapeHtml(firstName)}, your` : "Your"} appointment is cancelled.`)}
      ${lede("This is just a confirmation so there’s no uncertainty. The appointment below is no longer on the schedule.")}

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;border-top:2px solid ${BRAND.black};border-bottom:1px solid rgba(17,17,17,.2);">
        ${detailRow("Appointment", appointment)}
        ${detailRow("Service", booking.service)}
        ${detailRow("Vehicle", booking.vehicle)}
        ${detailRow("Location", booking.address)}
      </table>

      <div style="margin:0 0 12px;">${actionButton("Book a new time", "https://www.everydetail.co/book")}</div>
      ${noteBlock("Need help?", "Reply to this email and we’ll help you find another time. If you meant to keep the appointment, contact us as soon as you can.")}
    `,
    `Your ${appointment} Every Detail appointment has been cancelled`,
  );

  return sendEmail({
    to: booking.email,
    subject: `Your Every Detail appointment is cancelled`,
    html,
    replyTo: process.env.INTERNAL_NOTIFY_EMAIL || "hello@everydetail.co",
  });
}

