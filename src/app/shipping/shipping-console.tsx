"use client";

import { useState } from "react";

type Carrier = "ups" | "fedex";

type Tab = "track" | "rates" | "ship" | "validate";

const TABS: { id: Tab; label: string; description: string }[] = [
  { id: "track", label: "Track", description: "Look up a tracking number" },
  { id: "rates", label: "Rates", description: "Quote a shipment" },
  { id: "ship", label: "Ship", description: "Book a label" },
  { id: "validate", label: "Validate", description: "Check an address" },
];

export function ShippingConsole() {
  const [tab, setTab] = useState<Tab>("track");
  const [carrier, setCarrier] = useState<Carrier>("ups");

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
          Shipping console
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          UPS &amp; FedEx operations. Backed by{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            /api/shipping/*
          </code>
          .
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <CarrierToggle value={carrier} onChange={setCarrier} />
      </div>

      <p className="mb-6 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {TABS.find((t) => t.id === tab)?.description}
      </p>

      {tab === "track" && <TrackPanel carrier={carrier} />}
      {tab === "rates" && <RatesPanel carrier={carrier} />}
      {tab === "ship" && <ShipPanel carrier={carrier} />}
      {tab === "validate" && <ValidatePanel carrier={carrier} />}
    </div>
  );
}

function CarrierToggle({
  value,
  onChange,
}: {
  value: Carrier;
  onChange: (c: Carrier) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
      {(["ups", "fedex"] as Carrier[]).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-pressed={value === c}
          className={`rounded-md px-3 py-1.5 text-sm font-medium uppercase transition-colors ${
            value === c
              ? "bg-orange-600 text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function TrackPanel({ carrier }: { carrier: Carrier }) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const { call, state } = useApiCall();

  return (
    <Form
      onSubmit={() => {
        const params = new URLSearchParams({ carrier, trackingNumber });
        return call(`/api/shipping/track?${params}`, { method: "GET" });
      }}
      state={state}
      submitLabel="Track"
    >
      <Field label="Tracking number">
        <input
          required
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder={carrier === "ups" ? "1Z999AA10123456784" : "794635674987"}
          className={inputClass}
        />
      </Field>
    </Form>
  );
}

function RatesPanel({ carrier }: { carrier: Carrier }) {
  const [shipper, setShipper] = useState<AddressInput>(defaultAddress);
  const [recipient, setRecipient] = useState<AddressInput>(emptyAddress);
  const [pkg, setPkg] = useState<PackageInputState>(defaultPackage);
  const { call, state } = useApiCall();

  return (
    <Form
      onSubmit={() =>
        call("/api/shipping/rates", {
          method: "POST",
          body: JSON.stringify({
            carrier,
            shipper,
            recipient,
            packages: [pkg],
          }),
        })
      }
      state={state}
      submitLabel="Get rates"
    >
      <AddressFieldset legend="Shipper" value={shipper} onChange={setShipper} />
      <AddressFieldset legend="Recipient" value={recipient} onChange={setRecipient} />
      <PackageFieldset value={pkg} onChange={setPkg} />
    </Form>
  );
}

function ShipPanel({ carrier }: { carrier: Carrier }) {
  const [shipper, setShipper] = useState<AddressInput>(defaultAddress);
  const [recipient, setRecipient] = useState<AddressInput>(emptyAddress);
  const [pkg, setPkg] = useState<PackageInputState>(defaultPackage);
  const [serviceCode, setServiceCode] = useState(carrier === "ups" ? "03" : "FEDEX_GROUND");
  const [reference, setReference] = useState("");
  const { call, state } = useApiCall();

  return (
    <Form
      onSubmit={() =>
        call("/api/shipping/ship", {
          method: "POST",
          body: JSON.stringify({
            carrier,
            shipper,
            recipient,
            packages: [pkg],
            serviceCode,
            reference: reference || undefined,
          }),
        })
      }
      state={state}
      submitLabel="Book shipment"
    >
      <AddressFieldset legend="Shipper" value={shipper} onChange={setShipper} />
      <AddressFieldset legend="Recipient" value={recipient} onChange={setRecipient} />
      <PackageFieldset value={pkg} onChange={setPkg} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Service code">
          <input
            required
            value={serviceCode}
            onChange={(e) => setServiceCode(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Reference (optional)">
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
    </Form>
  );
}

function ValidatePanel({ carrier }: { carrier: Carrier }) {
  const [address, setAddress] = useState<AddressInput>(defaultAddress);
  const { call, state } = useApiCall();

  return (
    <Form
      onSubmit={() =>
        call("/api/shipping/validate-address", {
          method: "POST",
          body: JSON.stringify({ carrier, address }),
        })
      }
      state={state}
      submitLabel="Validate"
    >
      <AddressFieldset legend="Address" value={address} onChange={setAddress} />
    </Form>
  );
}

interface ApiState {
  loading: boolean;
  result?: unknown;
  error?: string;
}

function useApiCall() {
  const [state, setState] = useState<ApiState>({ loading: false });
  async function call(url: string, init: RequestInit) {
    setState({ loading: true });
    try {
      const res = await fetch(url, {
        ...init,
        headers: { "content-type": "application/json", ...(init.headers ?? {}) },
      });
      const text = await res.text();
      let parsed: unknown = text;
      try {
        parsed = JSON.parse(text);
      } catch {}
      if (!res.ok) {
        const msg =
          typeof parsed === "object" && parsed && "error" in parsed
            ? String((parsed as { error: unknown }).error)
            : `HTTP ${res.status}`;
        setState({ loading: false, error: msg, result: parsed });
        return;
      }
      setState({ loading: false, result: parsed });
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : "Network error",
      });
    }
  }
  return { call, state };
}

function Form({
  onSubmit,
  state,
  submitLabel,
  children,
}: {
  onSubmit: () => void | Promise<void>;
  state: ApiState;
  submitLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit();
        }}
        className="flex flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        {children}
        <button
          type="submit"
          disabled={state.loading}
          className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-orange-600 px-6 font-medium text-white shadow-sm transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.loading ? "Working…" : submitLabel}
        </button>
      </form>
      <ResultPanel state={state} />
    </div>
  );
}

function ResultPanel({ state }: { state: ApiState }) {
  return (
    <aside
      aria-live="polite"
      className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Result
      </div>
      {state.loading && (
        <p className="text-zinc-600 dark:text-zinc-400">Calling the carrier…</p>
      )}
      {!state.loading && state.error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      )}
      {!state.loading && state.result !== undefined && (
        <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-zinc-800 dark:text-zinc-200">
          {typeof state.result === "string"
            ? state.result
            : JSON.stringify(state.result, null, 2)}
        </pre>
      )}
      {!state.loading && state.result === undefined && !state.error && (
        <p className="text-zinc-500 dark:text-zinc-500">Submit the form to see output.</p>
      )}
    </aside>
  );
}

interface AddressInput {
  name: string;
  company: string;
  phone: string;
  street: string;
  city: string;
  stateCode: string;
  postalCode: string;
  countryCode: string;
  residential: boolean;
}

const emptyAddress: AddressInput = {
  name: "",
  company: "",
  phone: "",
  street: "",
  city: "",
  stateCode: "",
  postalCode: "",
  countryCode: "US",
  residential: false,
};

const defaultAddress: AddressInput = {
  name: "Revolver Roofing",
  company: "Revolver Roofing",
  phone: "5555550100",
  street: "1600 Amphitheatre Pkwy",
  city: "Mountain View",
  stateCode: "CA",
  postalCode: "94043",
  countryCode: "US",
  residential: false,
};

const defaultPackage = {
  weight: 5,
  weightUnit: "LB" as const,
  length: 12,
  width: 9,
  height: 6,
  dimensionUnit: "IN" as const,
};

function AddressFieldset({
  legend,
  value,
  onChange,
}: {
  legend: string;
  value: AddressInput;
  onChange: (next: AddressInput) => void;
}) {
  function patch(p: Partial<AddressInput>) {
    onChange({ ...value, ...p });
  }
  return (
    <fieldset className="grid gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {legend}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input
            value={value.name}
            onChange={(e) => patch({ name: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Company">
          <input
            value={value.company}
            onChange={(e) => patch({ company: e.target.value })}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Street">
        <input
          required
          value={value.street}
          onChange={(e) => patch({ street: e.target.value })}
          className={inputClass}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="City">
          <input
            required
            value={value.city}
            onChange={(e) => patch({ city: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="State">
          <input
            required
            value={value.stateCode}
            onChange={(e) => patch({ stateCode: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Postal code">
          <input
            required
            value={value.postalCode}
            onChange={(e) => patch({ postalCode: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Country">
          <input
            required
            value={value.countryCode}
            onChange={(e) => patch({ countryCode: e.target.value.toUpperCase() })}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Phone">
        <input
          value={value.phone}
          onChange={(e) => patch({ phone: e.target.value })}
          className={inputClass}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={value.residential}
          onChange={(e) => patch({ residential: e.target.checked })}
          className="h-4 w-4 rounded border-zinc-300 text-orange-600 focus:ring-orange-600 dark:border-zinc-700"
        />
        Residential address
      </label>
    </fieldset>
  );
}

interface PackageInputState {
  weight: number;
  weightUnit: "LB" | "KG";
  length: number;
  width: number;
  height: number;
  dimensionUnit: "IN" | "CM";
}

function PackageFieldset({
  value,
  onChange,
}: {
  value: PackageInputState;
  onChange: (next: PackageInputState) => void;
}) {
  function patch(p: Partial<PackageInputState>) {
    onChange({ ...value, ...p });
  }
  return (
    <fieldset className="grid gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Package
      </legend>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Weight">
          <input
            required
            type="number"
            min="0"
            step="0.1"
            value={value.weight}
            onChange={(e) => patch({ weight: Number(e.target.value) })}
            className={inputClass}
          />
        </Field>
        <Field label="Unit">
          <select
            value={value.weightUnit}
            onChange={(e) => patch({ weightUnit: e.target.value as "LB" | "KG" })}
            className={inputClass}
          >
            <option value="LB">LB</option>
            <option value="KG">KG</option>
          </select>
        </Field>
        <Field label="Dimension unit">
          <select
            value={value.dimensionUnit}
            onChange={(e) =>
              patch({ dimensionUnit: e.target.value as "IN" | "CM" })
            }
            className={inputClass}
          >
            <option value="IN">IN</option>
            <option value="CM">CM</option>
          </select>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Length">
          <input
            type="number"
            min="0"
            step="0.1"
            value={value.length}
            onChange={(e) => patch({ length: Number(e.target.value) })}
            className={inputClass}
          />
        </Field>
        <Field label="Width">
          <input
            type="number"
            min="0"
            step="0.1"
            value={value.width}
            onChange={(e) => patch({ width: Number(e.target.value) })}
            className={inputClass}
          />
        </Field>
        <Field label="Height">
          <input
            type="number"
            min="0"
            step="0.1"
            value={value.height}
            onChange={(e) => patch({ height: Number(e.target.value) })}
            className={inputClass}
          />
        </Field>
      </div>
    </fieldset>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";
