"use client";
import Image from "next/image";
import { useActionState } from "react";
import {
  CheckCircle2,
  Loader2,
  Send,
  UsersRound,
  BuildingComplex,
  PencilLine,
} from "lucide-react";

import { sendFeedback, type FeedbackState } from "@/app/actions/feedback";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const initialState: FeedbackState = { status: "idle" };

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
          {/* Tipo */}
          <Field data-invalid={!!err.tipo}>
            <FieldLabel>
              <UsersRound className="w-4 h-4 text-primary-color" />
              Soy
            </FieldLabel>

            <RadioGroup
              name="tipo"
              defaultValue={v.tipo || "inquilino"}
              className="flex gap-6"
            >
              <Field orientation="horizontal">
                <RadioGroupItem value="inquilino" id="tipo-inquilino" />
                <FieldLabel htmlFor="tipo-inquilino" className="font-normal">
                  Inquilino
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <RadioGroupItem value="invitado" id="tipo-invitado" />
                <FieldLabel htmlFor="tipo-invitado" className="font-normal">
                  Invitado
                </FieldLabel>
              </Field>
            </RadioGroup>

            <FieldError>{err.tipo?.[0]}</FieldError>
          </Field>
          <div className="grid gap-4">
            <Field>
              <FieldLabel htmlFor="habitacion">
                <BuildingComplex className="w-4  h-4 text-primary-color" />
                Torre y Número de departamento
              </FieldLabel>

              <Field data-invalid={!!err.torre}>
                <RadioGroup
                  name="torre"
                  defaultValue={v.torre || "torre_1"}
                  className="flex gap-6"
                >
                  <Field orientation="horizontal">
                    <RadioGroupItem value="torre_1" id="torre-1" />
                    <FieldLabel htmlFor="torre-1" className="font-normal">
                      Torre 1
                    </FieldLabel>
                  </Field>

                  <Field orientation="horizontal">
                    <RadioGroupItem value="torre_2" id="torre-2" />
                    <FieldLabel htmlFor="torre-2" className="font-normal">
                      Torre 2
                    </FieldLabel>
                  </Field>
                </RadioGroup>

                <FieldError>{err.torre?.[0]}</FieldError>
              </Field>
            </Field>
            <Field data-invalid={!!err.habitacion}>
              <Input
                id="habitacion"
                name="habitacion"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                required
                aria-invalid={!!err.habitacion}
                placeholder="N° departamento"
                defaultValue={v.habitacion}
                onChange={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    /\D/g,
                    "",
                  );
                }}
                className="h-11"
              />
              <FieldError>{err.habitacion?.[0]}</FieldError>
            </Field>
          </div>

          <Field data-invalid={!!err.comentarios}>
            <FieldLabel htmlFor="comentarios">
              {" "}
              <PencilLine className="w-4  h-4 text-primary-color" />
              Tus comentarios
            </FieldLabel>
            <Textarea
              id="comentarios"
              name="comentarios"
              rows={5}
              placeholder="Escribe aquí tus observaciones y sugerencias sobre el evento"
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
        <div className="mb-2 flex justify-center">
          <Image
            className="dark:invert"
            src="/metropolitan_logo_black.png"
            alt="Metropolitan logo"
            width={100}
            height={20}
            priority
          />
        </div>
        {children}
      </div>
    </div>
  );
}
