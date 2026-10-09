"use client";

import { type FormEvent, useState } from "react";
import { useProfileStore } from "@/stores/profileStore";
import { useToastStore } from "@/stores/toastStore";
import { useHydrated } from "@/hooks/useHydrated";
import { customerSchema } from "@/lib/validation";

const fields = [
  ["fullName", "Full name"], ["phone", "Phone"], ["email", "Email"], ["city", "City"], ["address", "Delivery address"], ["postalCode", "Postal code (optional)"]
] as const;

export function AddressBook() {
  const hydrated = useHydrated();
  const addresses = useProfileStore((s) => s.addresses);
  const save = useProfileStore((s) => s.save);
  const remove = useProfileStore((s) => s.remove);
  const push = useToastStore((s) => s.push);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formKey, setFormKey] = useState(0);
  if (!hydrated) return <div className="skeleton skeleton-block" aria-busy="true" />;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = customerSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    const { fullName, email, phone, address, city, postalCode } = parsed.data;
    save({ fullName, email, phone, address, city, postalCode });
    setErrors({});
    setFormKey((k) => k + 1);
    push("Address saved");
  }

  return (
    <>
      <h1 className="page-title">Addresses</h1>
      <section className="panel" aria-labelledby="saved-h">
        <h2 id="saved-h">Saved addresses ({addresses.length}/5)</h2>
        {addresses.length === 0 ? <p className="muted">Nothing saved yet. Add one below, or tick “Remember these details” at checkout.</p> : (
          <ul className="address-list">
            {addresses.map((a) => (
              <li key={a.id}>
                <span><strong>{a.fullName}</strong><small className="muted">{a.address}, {a.city} · {a.phone}</small></span>
                <button type="button" className="link-danger" onClick={() => remove(a.id)} aria-label={`Remove address ${a.address}`}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        <p className="muted">Addresses stay on this device and are offered at checkout.</p>
      </section>
      <section className="panel" aria-labelledby="add-h">
        <h2 id="add-h">Add an address</h2>
        <form onSubmit={submit} noValidate key={formKey} className="stack">
          <div className="form-grid">
            {fields.map(([name, label]) => (
              <div key={name} className={`field ${errors[name] ? "has-error" : ""}`}>
                <label htmlFor={`addr-${name}`}>{label}</label>
                <input id={`addr-${name}`} name={name} autoComplete="off" aria-invalid={errors[name] ? true : undefined} aria-describedby={errors[name] ? `addr-${name}-e` : undefined} />
                {errors[name] && <span id={`addr-${name}-e`} className="field-error">{errors[name]}</span>}
              </div>
            ))}
          </div>
          <div><button type="submit" className="btn btn-dark" disabled={addresses.length >= 5}>Save address</button>{addresses.length >= 5 && <span className="muted"> Remove one to add another.</span>}</div>
        </form>
      </section>
    </>
  );
}
