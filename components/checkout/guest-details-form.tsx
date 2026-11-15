"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Guest details captured at checkout. */
export interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  suburb: string;
}

export const emptyCheckoutForm: CheckoutForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  suburb: "",
};

function Field({
  label,
  required,
  hint,
  htmlFor,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && (
          <span className="text-primary" aria-hidden>
            {" "}
            *
          </span>
        )}
      </Label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

/** Checkout section: Guest name / contact, plus delivery address when delivering. */
export function GuestDetailsForm({
  form,
  fulfilment,
  deliverySuburbs,
  fieldErrors,
  onChange,
}: {
  form: CheckoutForm;
  fulfilment: "pickup" | "delivery";
  deliverySuburbs: string[];
  fieldErrors?: Record<string, string>;
  onChange: (field: keyof CheckoutForm, value: string) => void;
}) {
  return (
    <section className="border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold">Your details</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Name" required htmlFor="name" error={fieldErrors?.name}>
          <Input
            id="name"
            required
            autoComplete="name"
            className="mt-1.5 min-h-11 rounded-lg px-3.5"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </Field>
        <Field
          label="Phone"
          htmlFor="phone"
          hint="Email or phone — at least one is required."
          error={fieldErrors?.phone}
        >
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            className="mt-1.5 min-h-11 rounded-lg px-3.5"
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
          />
        </Field>
        <Field label="Email (optional)" htmlFor="email" error={fieldErrors?.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1.5 min-h-11 rounded-lg px-3.5"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </Field>
      </div>

      {fulfilment === "delivery" && (
        <div className="mt-4 grid gap-4">
          <Field label="Delivery address" required htmlFor="address" error={fieldErrors?.address}>
            <Textarea
              id="address"
              required
              rows={2}
              className="mt-1.5 min-h-11 rounded-lg px-3.5 resize-y"
              value={form.address}
              onChange={(e) => onChange("address", e.target.value)}
            />
          </Field>
          <Field label="Suburb" required htmlFor="suburb" error={fieldErrors?.suburb}>
            <Select
              required
              value={form.suburb || undefined}
              onValueChange={(v) => onChange("suburb", v)}
            >
              <SelectTrigger id="suburb" className="mt-1.5 min-h-11 w-full rounded-lg px-3.5">
                <SelectValue placeholder="Choose your suburb" />
              </SelectTrigger>
              <SelectContent>
                {deliverySuburbs.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      )}
    </section>
  );
}
