"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";

import FormField from "@/components/ui/FormField";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import content from "@/data/content.json";
import { contact } from "@/lib/contact";
import useClientValue from "@/lib/useClientValue";
import { openExternal } from "@/lib/openExternal";
import {
  MAX_NOMBRE,
  MAX_OBSERVACIONES,
  MAX_TEXTO_CORTO,
  validateQuote,
} from "@/lib/validateQuote";
import { buildQuoteUrl } from "@/lib/whatsapp";

const { fields, maxPassengers, submitLabel, fallbackLabel, fallbackHelp, errorSummaryTitle } =
  content.form;

const VALORES_INICIALES = {
  origen: "",
  destino: "",
  fechaSalida: "",
  fechaLlegada: "",
  horario: "",
  pasajeros: "1",
  incluyeMenores: "no",
  menores: "",
  observaciones: "",
  nombre: "",
  telefono: "",
};

/** Fecha local en `YYYY-MM-DD`. Solo se llama en el cliente. */
function hoyISO() {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

/**
 * Formulario de cotizacion.
 *
 * No guarda nada: ni backend, ni localStorage. Al enviar valido abre WhatsApp
 * con el mensaje ya armado, dentro del mismo handler del submit (si no, el
 * navegador lo toma como popup y lo bloquea). Si igual lo bloquea, queda a la
 * vista un enlace con la misma URL.
 *
 * El `min` de las fechas se resuelve DESPUES de hidratar (`useClientValue`):
 * con `cacheComponents` un `new Date()` en el render del servidor rompe el
 * prerender, y ademas provocaria un mismatch de hidratacion. La validacion
 * real no depende de ese `min`: `validateQuote` vuelve a comparar contra hoy
 * dentro del handler del submit.
 */
export default function QuoteForm() {
  const [values, setValues] = useState(VALORES_INICIALES);
  const [errors, setErrors] = useState({});
  const [errorFields, setErrorFields] = useState([]);
  const [fallbackUrl, setFallbackUrl] = useState(null);
  const [intento, setIntento] = useState(0);

  // Solo despues de hidratar: en el HTML prerenderizado no hay `min`.
  const minDate = useClientValue(hoyISO, undefined);

  const summaryRef = useRef(null);

  // El foco va al resumen de errores recien cuando ya esta en el DOM, para que
  // el lector de pantalla lo anuncie.
  useEffect(() => {
    if (intento > 0) summaryRef.current?.focus();
  }, [intento]);

  const viajanMenores = values.incluyeMenores === "si";

  const setValue = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const onChange = (event) => setValue(event.target.name, event.target.value);

  const handleSubmit = (event) => {
    event.preventDefault();
    setFallbackUrl(null);

    const payload = {
      ...values,
      menores: viajanMenores ? values.menores : "",
    };

    const result = validateQuote(payload, { today: hoyISO(), maxPasajeros: maxPassengers });

    if (!result.valid) {
      setErrors(result.errors);
      setErrorFields(result.fields);
      setIntento((value) => value + 1);
      return;
    }

    setErrors({});
    setErrorFields([]);

    const url = buildQuoteUrl(payload, { businessName: contact.businessName });
    // El fallback solo aparece si la pestana REALMENTE no se abrio: ver
    // `openExternal` para el porque de no usar el feature `noopener`.
    if (!openExternal(url)) setFallbackUrl(url);
  };

  const restantes = MAX_OBSERVACIONES - values.observaciones.length;

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      {errorFields.length > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-xl border border-danger/40 bg-danger/5 p-4 sm:col-span-2"
        >
          <p className="flex items-center gap-2 font-semibold text-danger">
            <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
            {errorSummaryTitle}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-9 text-sm text-danger">
            {errorFields.map((name) => (
              <li key={name}>
                <a href={`#campo-${name}`} className="underline underline-offset-2">
                  {fields[name]?.label ?? name}
                </a>
                : {errors[name]}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <FormField id="campo-origen" label={fields.origen.label} required error={errors.origen}>
        {({ id, describedBy, invalid, className }) => (
          <input
            id={id}
            name="origen"
            type="text"
            value={values.origen}
            onChange={onChange}
            placeholder={fields.origen.placeholder}
            maxLength={MAX_TEXTO_CORTO}
            autoComplete="off"
            required
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={className}
          />
        )}
      </FormField>

      <FormField id="campo-destino" label={fields.destino.label} required error={errors.destino}>
        {({ id, describedBy, invalid, className }) => (
          <input
            id={id}
            name="destino"
            type="text"
            value={values.destino}
            onChange={onChange}
            placeholder={fields.destino.placeholder}
            maxLength={MAX_TEXTO_CORTO}
            autoComplete="off"
            required
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={className}
          />
        )}
      </FormField>

      <FormField
        id="campo-fechaSalida"
        label={fields.fechaSalida.label}
        required
        error={errors.fechaSalida}
      >
        {({ id, describedBy, invalid, className }) => (
          <input
            id={id}
            name="fechaSalida"
            type="date"
            value={values.fechaSalida}
            onChange={onChange}
            min={minDate}
            required
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={className}
          />
        )}
      </FormField>

      <FormField
        id="campo-fechaLlegada"
        label={fields.fechaLlegada.label}
        help={fields.fechaLlegada.help}
        error={errors.fechaLlegada}
      >
        {({ id, describedBy, invalid, className }) => (
          <input
            id={id}
            name="fechaLlegada"
            type="date"
            value={values.fechaLlegada}
            onChange={onChange}
            min={values.fechaSalida || minDate}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={className}
          />
        )}
      </FormField>

      <FormField id="campo-horario" label={fields.horario.label} required error={errors.horario}>
        {({ id, describedBy, invalid, className }) => (
          <input
            id={id}
            name="horario"
            type="time"
            value={values.horario}
            onChange={onChange}
            required
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={className}
          />
        )}
      </FormField>

      <FormField
        id="campo-pasajeros"
        label={fields.pasajeros.label}
        required
        error={errors.pasajeros}
      >
        {({ id, describedBy, invalid, className }) => (
          <input
            id={id}
            name="pasajeros"
            type="number"
            inputMode="numeric"
            min={1}
            max={maxPassengers}
            step={1}
            value={values.pasajeros}
            onChange={onChange}
            required
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={className}
          />
        )}
      </FormField>

      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-semibold text-brand-navy">
          {fields.incluyeMenores.label}
        </legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {[
            { value: "no", label: fields.incluyeMenores.no },
            { value: "si", label: fields.incluyeMenores.yes },
          ].map((option) => (
            <label
              key={option.value}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                values.incluyeMenores === option.value
                  ? "border-brand-blue bg-brand-blue/10 text-brand-navy"
                  : "border-slate-300 text-ink-soft hover:border-brand-blue/50"
              }`}
            >
              <input
                type="radio"
                name="incluyeMenores"
                value={option.value}
                checked={values.incluyeMenores === option.value}
                onChange={onChange}
                className="size-4 accent-brand-blue"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {viajanMenores ? (
        <FormField
          id="campo-menores"
          label={fields.menores.label}
          required
          error={errors.menores}
        >
          {({ id, describedBy, invalid, className }) => (
            <input
              id={id}
              name="menores"
              type="number"
              inputMode="numeric"
              min={1}
              max={maxPassengers}
              step={1}
              value={values.menores}
              onChange={onChange}
              required
              aria-required="true"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={className}
            />
          )}
        </FormField>
      ) : null}

      <FormField id="campo-nombre" label={fields.nombre.label} required error={errors.nombre}>
        {({ id, describedBy, invalid, className }) => (
          <input
            id={id}
            name="nombre"
            type="text"
            value={values.nombre}
            onChange={onChange}
            placeholder={fields.nombre.placeholder}
            maxLength={MAX_NOMBRE}
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={className}
          />
        )}
      </FormField>

      <FormField id="campo-telefono" label={fields.telefono.label} required error={errors.telefono}>
        {({ id, describedBy, invalid, className }) => (
          <input
            id={id}
            name="telefono"
            type="tel"
            inputMode="tel"
            value={values.telefono}
            onChange={onChange}
            placeholder={fields.telefono.placeholder}
            maxLength={25}
            autoComplete="tel"
            required
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={className}
          />
        )}
      </FormField>

      <FormField
        id="campo-observaciones"
        label={fields.observaciones.label}
        error={errors.observaciones}
        className="sm:col-span-2"
      >
        {({ id, describedBy, invalid, className }) => (
          <>
            <textarea
              id={id}
              name="observaciones"
              rows={4}
              value={values.observaciones}
              onChange={onChange}
              placeholder={fields.observaciones.placeholder}
              maxLength={MAX_OBSERVACIONES}
              aria-invalid={invalid}
              aria-describedby={
                [describedBy, `${id}-contador`].filter(Boolean).join(" ") || undefined
              }
              className={`${className} resize-y`}
            />
            <p id={`${id}-contador`} aria-live="polite" className="mt-1 text-right text-xs text-ink-soft">
              {restantes} {fields.observaciones.counterSuffix}
            </p>
          </>
        )}
      </FormField>

      <div className="pr-16 sm:col-span-2 sm:pr-0">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-6 py-4 text-base font-semibold text-white transition-colors duration-200 hover:bg-brand-blue-deep active:bg-brand-navy sm:w-auto"
        >
          <WhatsAppIcon className="size-5" />
          {submitLabel}
        </button>

        <p className="mt-3 text-xs leading-relaxed text-ink-soft">{content.contact.formNote}</p>

        {fallbackUrl ? (
          <p className="mt-3 rounded-xl border border-brand-gold/50 bg-brand-gold/10 p-4 text-sm text-ink">
            {fallbackHelp}{" "}
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-blue-deep underline underline-offset-2"
            >
              {fallbackLabel}
            </a>
          </p>
        ) : null}
      </div>
    </form>
  );
}
