"use client";

import { useActionState, useId } from "react";
import { submitBid, type BidFormState } from "@/app/actions/bid";

const initialState: BidFormState = { status: "idle" };

const SYSTEM_OPTIONS = [
  { value: "tpo", label: "TPO" },
  { value: "epdm", label: "EPDM" },
  { value: "modified-bitumen", label: "Modified bitumen" },
  { value: "bur", label: "Built-up roofing (BUR)" },
  { value: "pvc", label: "PVC single-ply" },
  { value: "metal", label: "Metal standing-seam" },
  { value: "tear-off-and-replace", label: "Tear-off + replace (any system)" },
  { value: "other", label: "Other / unsure" },
] as const;

export function BidForm() {
  const [state, formAction, pending] = useActionState(submitBid, initialState);
  const ids = {
    companyName: useId(),
    contactName: useId(),
    contactEmail: useId(),
    contactPhone: useId(),
    projectName: useId(),
    projectLocation: useId(),
    projectSizeSqFt: useId(),
    systemType: useId(),
    decisionDate: useId(),
    prevailingWage: useId(),
    drawingsLink: useId(),
    notes: useId(),
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
      aria-describedby={state.status === "error" ? "bid-form-error" : undefined}
      className="grid w-full gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-left"
    >
      <input
        type="text"
        name="website"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden
        className="hidden"
      />

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Your company</legend>
        <Field id={ids.companyName} label="Company" name="companyName" autoComplete="organization" required error={state.errors?.companyName} />
        <Field id={ids.contactName} label="Your name" name="contactName" autoComplete="name" required error={state.errors?.contactName} />
        <Field id={ids.contactEmail} label="Work email" name="contactEmail" type="email" autoComplete="email" required error={state.errors?.contactEmail} />
        <Field id={ids.contactPhone} label="Work phone" name="contactPhone" type="tel" autoComplete="tel" required error={state.errors?.contactPhone} />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="text-sm font-semibold text-zinc-200">Project</legend>
        <Field id={ids.projectName} label="Project name" name="projectName" required error={state.errors?.projectName} />
        <Field id={ids.projectLocation} label="Location (city, state)" name="projectLocation" required error={state.errors?.projectLocation} />
        <Field
          id={ids.projectSizeSqFt}
          label="Approx. size (sq ft)"
          name="projectSizeSqFt"
          type="number"
          required
          inputMode="numeric"
          error={state.errors?.projectSizeSqFt}
        />
        <SelectField
          id={ids.systemType}
          label="System type"
          name="systemType"
          required
          options={SYSTEM_OPTIONS}
          error={state.errors?.systemType}
        />
        <Field
          id={ids.decisionDate}
          label="Decision date"
          name="decisionDate"
          type="date"
          error={state.errors?.decisionDate}
        />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-200">Prevailing wage?</span>
          <div className="flex h-10 items-center gap-4 text-sm text-zinc-200">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="prevailingWage" value="no" defaultChecked />
              No
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="prevailingWage" value="yes" />
              Yes
            </label>
          </div>
        </div>
      </fieldset>

      <Field
        id={ids.drawingsLink}
        label="Drawings link"
        name="drawingsLink"
        type="url"
        autoComplete="off"
        placeholder="https://… (Dropbox / Drive / Procore link)"
        error={state.errors?.drawingsLink}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor={ids.notes} className="text-sm font-medium text-zinc-200">
          Anything else? <span className="text-zinc-500">(optional)</span>
        </label>
        <textarea
          id={ids.notes}
          name="notes"
          rows={3}
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
          placeholder="Scope clarifications, prebid meeting date, alternates…"
        />
      </div>

      {state.status === "error" && state.message && (
        <p id="bid-form-error" role="alert" className="text-sm text-rose-300">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-orange-600 px-6 font-medium text-white shadow-sm transition-colors hover:bg-orange-700 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Invite us to bid"}
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
  inputMode?: "numeric" | "text";
  placeholder?: string;
  error?: string;
};

function Field({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  required,
  inputMode,
  placeholder,
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
        inputMode={inputMode}
        placeholder={placeholder}
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

type SelectFieldProps = {
  id: string;
  label: string;
  name: string;
  required?: boolean;
  options: ReadonlyArray<{ value: string; label: string }>;
  error?: string;
};

function SelectField({ id, label, name, required, options, error }: SelectFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-200">
        {label}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue=""
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-zinc-100"
      >
        <option value="" disabled>
          Choose one…
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
