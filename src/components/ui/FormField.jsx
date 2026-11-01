/**
 * Campo de formulario con `<label>` visible, texto de ayuda y error, todos
 * conectados por `aria-describedby`.
 *
 * `children` es una funcion que recibe los atributos accesibles ya armados,
 * asi el control (input / select / textarea) no los puede olvidar.
 */
export const CONTROL_CLASS =
  "w-full rounded-xl border bg-surface px-4 py-3 text-base text-ink placeholder:text-slate-400 transition-colors duration-200 focus:border-brand-blue focus:outline-none aria-[invalid=true]:border-danger";

export default function FormField({
  id,
  label,
  help,
  error,
  required = false,
  className = "",
  children,
}) {
  const helpId = help ? `${id}-ayuda` : null;
  const errorId = error ? `${id}-error` : null;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-brand-navy">
        {label}
        {required ? (
          <>
            {" "}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          </>
        ) : null}
      </label>

      {help ? (
        <p id={helpId} className="mt-1 text-xs text-ink-soft">
          {help}
        </p>
      ) : null}

      <div className="mt-2">
        {children({
          id,
          describedBy,
          invalid: Boolean(error),
          className: `${CONTROL_CLASS} ${error ? "border-danger" : "border-slate-300"}`,
        })}
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
