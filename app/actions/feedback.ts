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
    from: `Comentarios ${torre} <onboarding@resend.dev>`,
    to: process.env.FEEDBACK_EMAIL!,
    subject: `Nuevo comentario de – ${torre}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px">
        <h2 style="margin:0 0 12px">Nuevo comentario de un ${escapeHtml(d.tipo)}</h2>
        <table style="border-collapse:collapse;margin-bottom:16px">
          <tr><td style="padding:4px 12px 4px 0;color:#666">Torre</td><td>${torre}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#666">Departamento</td><td>${escapeHtml(d.habitacion)}</td></tr>
        </table>
        <div style="background:#f5f5f5;border-radius:8px;padding:16px;white-space:pre-wrap">${escapeHtml(d.comentarios)}</div>
      </div>
    `,
  });

  if (error) {
    console.error("Resend:", error);
    return {
      status: "error",
      message: "No pudimos enviar tu comentario. Intenta de nuevo.",
      values: raw,
    };
  }

  return { status: "success" };
}
