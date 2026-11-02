"use server";

import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const torres = {
  torre_1: "Torre 1",
  torre_2: "Torre 2",
} as const;

const schema = z.object({
  tipo: z.enum(["invitado", "inquilino"], { message: "Selecciona una opción" }),
  torre: z.enum(["torre_1", "torre_2"], { message: "Selecciona una torre" }),
  habitacion: z
    .string()
    .trim()
    .min(1, "Ingresa tu número de departamento")
    .max(10, "Máximo 10 dígitos")
    .regex(/^\d+$/, "Solo se permiten números"),
  comentarios: z
    .string()
    .trim()
    .min(5, "Cuéntanos un poco más (mínimo 5 caracteres)")
    .max(2000, "Máximo 2000 caracteres"),
});

export type FeedbackState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<keyof z.infer<typeof schema>, string[]>>;
  values?: Record<string, string>;
};

const escapeHtml = (s = "") =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

export async function sendFeedback(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  // Honeypot: los bots llenan este campo oculto, las personas no
  if (formData.get("website")) return { status: "success" };

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: parsed.error.flatten().fieldErrors,
      values: raw,
    };
  }

  const d = parsed.data;
  const torre = torres[d.torre];

  const { error } = await resend.emails.send({
    from: `Sugerencia ${torre} <noreply@feedback.safihotel.com>`,
    to: process.env.FEEDBACK_EMAIL!,
    subject: `Sugerencia – ${torre}`,
    html: `
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Torre ${torre}, departamento ${escapeHtml(d.habitacion)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f3f4f6" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

          <!-- Encabezado -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;color:#1e3a5f;">
                Buzón de sugerencias
              </p>
              <h1 style="margin:0;font-size:22px;line-height:30px;font-weight:600;color:#111827;">
                Sugerencia ${escapeHtml(d.tipo)}
              </h1>
            </td>
          </tr>

          <!-- Datos -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
                <tr>
                  <td width="50%" valign="top" style="padding:16px 12px 16px 0;">
                    <p style="margin:0 0 4px;font-size:12px;line-height:16px;color:#6b7280;">Torre</p>
                    <p style="margin:0;font-size:16px;line-height:22px;font-weight:600;color:#111827;">${torre}</p>
                  </td>
                  <td width="50%" valign="top" style="padding:16px 0 16px 12px;">
                    <p style="margin:0 0 4px;font-size:12px;line-height:16px;color:#6b7280;">Departamento</p>
                    <p style="margin:0;font-size:16px;line-height:22px;font-weight:600;color:#111827;">${escapeHtml(d.habitacion)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Comentarios -->
          <tr>
            <td style="padding:24px 32px 32px;">
              <p style="margin:0 0 8px;font-size:12px;line-height:16px;color:#6b7280;">Comentarios</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="#f9fafb" style="padding:16px;background-color:#f9fafb;border-left:3px solid #1e3a5f;font-size:15px;line-height:24px;color:#374151;word-break:break-word;">
                    ${escapeHtml(d.comentarios).replace(/\r?\n/g, "<br>")}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td bgcolor="#f9fafb" style="padding:16px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 8px 8px;font-size:12px;line-height:18px;color:#6b7280;">
              Este correo se generó automáticamente a partir del formulario de sugerencias.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
    `,
  });

  if (error) {
    console.error("Resend:", error);
    return {
      status: "error",
      message: "No pudimos enviar tu sugerencia. Intenta de nuevo.",
      values: raw,
    };
  }

  return { status: "success" };
}
