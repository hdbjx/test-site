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
  </head>
  <body style="margin:0;padding:0;background:${BRAND.cream};font-family:Arial,Helvetica,sans-serif;color:${BRAND.black};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${escapeHtml(preheader)}
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.cream};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:620px;background:#ffffff;border:2px solid ${BRAND.black};">
            <tr>
              <td style="background:${BRAND.red};padding:24px 28px;">
                <div style="font-size:12px;line-height:1.2;letter-spacing:2px;text-transform:uppercase;color:${BRAND.beige};font-weight:700;">
                  Every Detail
                </div>
                <div style="margin-top:6px;font-size:13px;color:#ffffff;">
                  Premium mobile detailing · Decatur, GA
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:34px 28px;">
                ${content}
              </td>
            </tr>

            <tr>
              <td style="padding:22px 28px;background:${BRAND.beige};border-top:2px solid ${BRAND.black};font-size:12px;line-height:1.6;color:${BRAND.black};">
                Every Detail · Mobile detailing brought to your driveway<br>
                Questions? Reply to this email and we'll help.
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

function detailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid #dedbd5;font-size:13px;color:${BRAND.gray};vertical-align:top;width:120px;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:11px 0;border-bottom:1px solid #dedbd5;font-size:14px;color:${BRAND.black};font-weight:700;vertical-align:top;">
        ${escapeHtml(value)}
      </td>
    </tr>
  `;
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
    <div style="margin:28px 0 0;border:2px solid ${BRAND.black};background:${BRAND.black};">
      <div style="padding:10px 12px;color:#fff;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;">The transformation</div>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="table-layout:fixed;background:#fff;">
        <tr>
          <td width="50%" style="padding:0;border-right:2px solid ${BRAND.black};vertical-align:top;">
            <div style="padding:7px 10px;background:${BRAND.beige};font-size:10px;letter-spacing:1.3px;font-weight:700;">BEFORE</div>
            <img src="${escapeHtml(beforeUrl)}" alt="Before detail" width="100%" style="display:block;width:100%;height:auto;border:0;">
          </td>
          <td width="50%" style="padding:0;vertical-align:top;">
            <div style="padding:7px 10px;background:${BRAND.beige};font-size:10px;letter-spacing:1.3px;font-weight:700;">AFTER</div>
            <img src="${escapeHtml(afterUrl)}" alt="After detail" width="100%" style="display:block;width:100%;height:auto;border:0;">
          </td>
        </tr>
      </table>
    </div>`;
}

export async function sendAfterJobEmail(input: AfterJobEmail, receiptBase64?: string) {
  const firstName = input.name.trim().split(/\s+/)[0] || input.name || "there";
  const completed = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", month: "long", day: "numeric", year: "numeric"
  }).format(new Date(input.completedAt));
  const reviewUrl = process.env.GOOGLE_REVIEW_URL || "https://www.google.com/search?q=Every+Detail+Mobile+Detailing#lrd=0x8e30f21fe0cce555:0x394893f8064359ae,1,,,,";
  const detailPlusUrl = process.env.DETAIL_PLUS_URL || "https://www.everydetail.co/detailplus";
  const bookUrl = process.env.BOOKING_URL || "https://www.everydetail.co/book";

  const modules = [
    input.includeReceipt ? `<div style="margin-top:24px;padding:18px;background:${BRAND.cream};border-left:5px solid ${BRAND.coral};"><b>Receipt</b><br><span style="font-size:13px;color:${BRAND.gray};">Your ${escapeHtml(input.receiptNumber)} receipt for ${formatMoney(input.total)} is attached as a PDF.</span></div>` : "",
    input.includeReview ? `<div style="margin-top:24px;padding:20px;border:2px solid ${BRAND.black};"><div style="font-size:11px;letter-spacing:1.5px;color:${BRAND.coral};font-weight:700;">HOW DID WE DO?</div><h2 style="margin:7px 0 9px;font-size:23px;">Love how it turned out?</h2><p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.gray};">A Google review helps our small team more than you might think.</p><a href="${escapeHtml(reviewUrl)}" style="display:inline-block;padding:11px 15px;background:${BRAND.red};color:#fff;text-decoration:none;font-weight:700;font-size:13px;">Leave a review</a></div>` : "",
    input.includeDetailPlus ? `<div style="margin-top:24px;padding:20px;background:${BRAND.red};color:#fff;"><div style="font-size:11px;letter-spacing:1.5px;color:${BRAND.beige};font-weight:700;">DETAIL+</div><h2 style="margin:7px 0 9px;font-size:23px;color:#fff;">Keep it from getting back to square one.</h2><p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#fff;">Detail+ puts your vehicle on a recurring maintenance schedule so we come back before the mess builds up again.</p><a href="${escapeHtml(detailPlusUrl)}" style="display:inline-block;padding:11px 15px;background:#fff;color:${BRAND.red};text-decoration:none;font-weight:700;font-size:13px;">Explore Detail+</a></div>` : "",
  ].join("");

  const html = shell(`
    <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:${BRAND.coral};font-weight:700;">Detail complete</div>
    <h1 style="margin:10px 0 14px;font-size:34px;line-height:1.05;color:${BRAND.black};">Your vehicle is all set${firstName ? `, ${escapeHtml(firstName)}` : ""}.</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:${BRAND.gray};">Thanks for choosing Every Detail. Here is a recap of today’s visit.</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${detailRow("Vehicle", input.vehicle)}
      ${detailRow("Service", input.service)}
      ${detailRow("Completed", completed)}
    </table>
    ${afterJobPhotoSplit(input.beforeUrl, input.afterUrl)}
    <div style="margin-top:26px;padding:18px;background:${BRAND.cream};border-left:5px solid ${BRAND.coral};font-size:14px;line-height:1.65;"><b>Keep it looking this good.</b><br>Regular upkeep is easier than another reset. <a href="${escapeHtml(bookUrl)}" style="color:${BRAND.red};font-weight:700;">Book your next visit</a> whenever you are ready.</div>
    ${modules}
    <p style="margin:26px 0 0;font-size:14px;line-height:1.65;color:${BRAND.gray};">Something not right? Reply directly to this email and we’ll help.</p>
  `, `Your ${input.vehicle} is all set.`);

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
      <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:${BRAND.coral};font-weight:700;">
        You're booked
      </div>

      <h1 style="margin:10px 0 14px;font-size:34px;line-height:1.05;color:${BRAND.black};">
        We'll see you in the driveway.
      </h1>

      <p style="margin:0 0 26px;font-size:16px;line-height:1.65;color:${BRAND.gray};">
        Hi ${escapeHtml(booking.name)}, your Every Detail appointment is confirmed. We'll bring the power, water, equipment, and everything needed for the detail.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${vehicleRows}
        ${detailRow("When", appointment)}
        ${detailRow("Where", booking.address)}
        ${detailRow("Total", money)}
      </table>

      <div style="margin-top:26px;padding:18px;background:${BRAND.cream};border-left:5px solid ${BRAND.coral};font-size:14px;line-height:1.6;">
        Please make sure we can access ${lines.length > 1 ? "all vehicles" : "the vehicle"} at the scheduled time. You do not need to provide power or water.
      </div>
    `,
    `${booking.service} confirmed for ${appointment}`,
  );

  const internalHtml = shell(
    `
      <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:${BRAND.coral};font-weight:700;">
        New website booking
      </div>

      <h1 style="margin:10px 0 22px;font-size:32px;line-height:1.08;">
        ${escapeHtml(booking.service)}
      </h1>

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${detailRow("Customer", booking.name)}
        ${detailRow("Phone", booking.phone)}
        ${detailRow("Email", booking.email)}
        ${vehicleRows}
        ${detailRow("When", appointment)}
        ${detailRow("Address", booking.address)}
        ${detailRow("Total", money)}
        ${booking.leadSource ? detailRow("Heard about us", `${booking.leadSource}${booking.leadSourceDetail ? ` · ${booking.leadSourceDetail}` : ""}`) : ""}
        ${booking.notes ? detailRow("Notes", booking.notes) : ""}
      </table>
    `,
    `New booking: ${booking.service}`,
  );

  const [customer, internal] = await Promise.allSettled([
    sendEmail({
      to: booking.email,
      subject: `You're booked with Every Detail`,
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

  const rows = Object.entries(fields)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => detailRow(fieldLabel(key), value))
    .join("");

  const internalHtml = shell(
    `
      <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:${BRAND.coral};font-weight:700;">
        New website request
      </div>

      <h1 style="margin:10px 0 22px;font-size:32px;line-height:1.08;">
        ${escapeHtml(title)}
      </h1>

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${rows}
      </table>
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
    const customerHtml = shell(
      `
        <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:${BRAND.coral};font-weight:700;">
          We got it
        </div>

        <h1 style="margin:10px 0 14px;font-size:34px;line-height:1.05;">
          Thanks${fields.name ? `, ${escapeHtml(fields.name.split(" ")[0])}` : ""}.
        </h1>

        <p style="margin:0;font-size:16px;line-height:1.65;color:${BRAND.gray};">
          Your ${type === "detailplus" ? "Detail+ request" : type === "quote" ? "quote request" : "request"} made it to the Every Detail team. We'll review the details and follow up with you directly.
        </p>

        <div style="margin-top:26px;padding:18px;background:${BRAND.cream};border-left:5px solid ${BRAND.coral};font-size:14px;line-height:1.6;">
          Need to add something? Just reply to this email.
        </div>
      `,
      "Your request made it to Every Detail",
    );

    jobs.push(
      sendEmail({
        to: customerEmail,
        subject: "We got your request · Every Detail",
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

/** Send the single customer reminder used roughly 24 hours before a job. */
export async function sendJobReminderEmail(booking: JobReminderEmail) {
  const appointment = formatAppointment(booking.start);
  const firstName = booking.name.trim().split(/\s+/)[0] || booking.name;

  const html = shell(
    `
      <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:${BRAND.coral};font-weight:700;">
        Appointment reminder
      </div>

      <h1 style="margin:10px 0 14px;font-size:34px;line-height:1.05;color:${BRAND.black};">
        We'll see you tomorrow${firstName ? `, ${escapeHtml(firstName)}` : ""}.
      </h1>

      <p style="margin:0 0 26px;font-size:16px;line-height:1.65;color:${BRAND.gray};">
        Just a reminder that your Every Detail appointment is coming up. We'll bring the power, water, equipment, and products needed for the detail.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${detailRow("When", appointment)}
        ${detailRow("Vehicle", booking.vehicle)}
        ${detailRow("Service", booking.service)}
        ${detailRow("Where", booking.address)}
      </table>

      <div style="margin-top:26px;padding:18px;background:${BRAND.cream};border-left:5px solid ${BRAND.coral};font-size:14px;line-height:1.6;">
        Please make sure we can access the vehicle at the scheduled time. You do not need to provide power or water. If anything has changed, reply to this email and we'll help.
      </div>
    `,
    `Reminder: your Every Detail appointment is ${appointment}`,
  );

  return sendEmail({
    to: booking.email,
    subject: `Reminder: your Every Detail appointment is tomorrow`,
    html,
    replyTo: process.env.INTERNAL_NOTIFY_EMAIL || "hello@everydetail.co",
  });
}
