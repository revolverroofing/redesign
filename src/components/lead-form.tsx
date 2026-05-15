"use client";

import { useActionState, useId } from "react";
import { submitLead, type LeadFormState } from "@/app/actions/lead";

const initialState: LeadFormState = { status: "idle" };

const SERVICE_OPTIONS = [
  { value: "residential", label: "Residential roof" },
  { value: "commercial", label: "Commercial roof" },
  { value: "repairs", label: "Repair / leak" },
  { value: "other", label: "Something else" },
] as const;

export function LeadForm() {
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const ids = {
    name: useId(),
    phone: useId(),
    email: useId(),
    address: useId(),
    serviceType: useId(),
    message: useId(),
  };

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-emerald-700/50 bg-emerald-950/40 p-6 text-emerald-100"
      >
        <p className="font-semibold">Got it.</p>
        <p className="mt-1 text-sm text-emerald-200">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      aria-describedby={state.status === "error" ? "lead-form-error" : undefined}
      className="grid w-full gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-left"
    >
      <input
        type="text"
        name="company"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden
        className="hidden"
      />

      <Field
        id={ids.name}
        label="Name"
        name="name"
        autoComplete="name"
        required
        error={state.errors?.name}
      />
      <Field
        id={ids.phone}
        label="Phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        required
        error={state.errors?.phone}
      />
      <Field
        id={ids.email}
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state.errors?.email}
      />
      <Field
        id={ids.address}
        label="Property address"
        name="address"
        autoComplete="street-address"
        error={state.errors?.address}
      />

      <div className="flex flex-col gap-1">
        <label
          htmlFor={ids.serviceType}
          className="text-sm font-medium text-zinc-200"
        >
          What do you need?
        </label>
        <select
          id={ids.serviceType}
          name="serviceType"
          required
          defaultValue=""
          aria-invalid={Boolean(state.errors?.serviceType) || undefined}
          aria-describedby={
            state.errors?.serviceType ? `${ids.serviceType}-error` : undefined
          }
          className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-zinc-100"
        >
          <option value="" disabled>
            Choose one…
          </option>
          {SERVICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {state.errors?.serviceType && (
          <p id={`${ids.serviceType}-error`} className="text-sm text-rose-300">
            {state.errors.serviceType}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor={ids.message}
          className="text-sm font-medium text-zinc-200"
        >
          Anything we should know? <span className="text-zinc-500">(optional)</span>
        </label>
        <textarea
          id={ids.message}
          name="message"
          rows={3}
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
        />
      </div>

      {state.status === "error" && state.message && (
        <p
          id="lead-form-error"
          role="alert"
          className="text-sm text-rose-300"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-orange-600 px-6 font-medium text-white shadow-sm transition-colors hover:bg-orange-700 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Request an estimate"}
      </button>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
};

function Field({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  required,
  error,
}: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-200">
        {label}
        {!required && <span className="text-zinc-500"> (optional)</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-zinc-100"
      />
      {error && (
        <p id={errorId} className="text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
