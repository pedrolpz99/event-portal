"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { sendFeedback, type FeedbackState } from "@/app/actions/feedback";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: FeedbackState = { status: "idle" };

const ratings = [
  { value: 1, emoji: "😞", label: "Mala" },
  { value: 2, emoji: "😕", label: "Regular" },
  { value: 3, emoji: "😐", label: "Normal" },
  { value: 4, emoji: "🙂", label: "Buena" },
  { value: 5, emoji: "😍", label: "Excelente" },
];

export function FeedbackForm() {
  const [state, formAction, isPending] = useActionState(
    sendFeedback,
    initialState,
  );

  const v = state.values ?? {};
  const err = state.errors ?? {};

  if (state.status === "success") {
    return (
      <Card>
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-950">
            <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-semibold">¡Gracias por tu opinión!</h2>
          <p className="max-w-xs text-muted-foreground">
            Tus comentarios llegaron a nuestro equipo y nos ayudan a mejorar
            cada evento.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-8 text-center">
        {/* <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
          ✨
        </div> */}
        <h1 className="text-2xl font-semibold tracking-tight">
          ¿Cómo fue tu experiencia?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu opinión es importante. Cuéntanos tus sugerencias para ayudarnos a
          mejorar la experiencia del evento.
        </p>
      </div>

      <form action={formAction} key={JSON.stringify(v)} noValidate>
        {/* Honeypot anti-spam: invisible para personas */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        <FieldGroup>
          {/* Calificación */}
          {/* <Field data-invalid={!!err.calificacion}>
            <FieldLabel>Califica tu experiencia</FieldLabel>
            <div role="radiogroup" className="grid grid-cols-5 gap-2">
              {ratings.map((r) => (
                <label key={r.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="calificacion"
                    value={r.value}
                    defaultChecked={v.calificacion === String(r.value)}
                    className="peer sr-only"
                  />
                  <span className="flex flex-col items-center gap-1 rounded-xl border-2 border-transparent bg-muted/60 py-3 transition-all hover:bg-muted peer-checked:scale-105 peer-checked:border-primary peer-checked:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                    <span className="text-2xl sm:text-3xl">{r.emoji}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {r.label}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <FieldError>{err.calificacion?.[0]}</FieldError>
          </Field> */}

          {/* Tipo */}
          <Field data-invalid={!!err.tipo}>
            <FieldLabel htmlFor="tipo">Soy</FieldLabel>
            <Select name="tipo" defaultValue={v.tipo || "invitado"}>
              <SelectTrigger id="tipo" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invitado">Invitado</SelectItem>
                <SelectItem value="inquilino">Inquilino</SelectItem>
              </SelectContent>
            </Select>
            <FieldError>{err.tipo?.[0]}</FieldError>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="habitacion">Número de habitación</FieldLabel>
              <Input
                id="habitacion"
                name="habitacion"
                inputMode="numeric"
                placeholder="Ej. 123"
                defaultValue={v.habitacion}
                className="h-11"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="departamento">Departamento</FieldLabel>
              <Input
                id="departamento"
                name="departamento"
                placeholder="Ej. B-4"
                defaultValue={v.departamento}
                className="h-11"
              />
            </Field>
          </div>

          <Field data-invalid={!!err.comentarios}>
            <FieldLabel htmlFor="comentarios">Tus comentarios</FieldLabel>
            <Textarea
              id="comentarios"
              name="comentarios"
              rows={5}
              placeholder="¿Qué te gustó? ¿Qué podríamos mejorar?"
              defaultValue={v.comentarios}
              className="min-h-32 resize-none"
            />
            <FieldError>{err.comentarios?.[0]}</FieldError>
          </Field>

          {state.status === "error" && state.message && (
            <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.message}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="h-12 w-full text-base"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" /> Enviando…
              </>
            ) : (
              <>
                <Send /> Enviar comentarios
              </>
            )}
          </Button>
        </FieldGroup>
      </form>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#202124] from-primary/5 to-background px-4 py-8 sm:py-16">
      <div className="mx-auto w-full max-w-lg rounded-2xl border bg-card p-6 shadow-sm sm:p-10">
        {children}
      </div>
    </div>
  );
}
