"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { login, register, getPrefill } from "@/lib/api";
import type { AccountPrefill } from "@/lib/types";

const STORAGE_KEY = "tiffin-club-token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function SignInButton({ onSignedIn }: { onSignedIn: (p: AccountPrefill) => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", password_confirmation: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function finish(token: string) {
    localStorage.setItem(STORAGE_KEY, token);
    try {
      const prefill = await getPrefill(token);
      onSignedIn(prefill);
    } catch {
      onSignedIn({ name: null, email: null, phone: null, address: null, suburb: null });
    }
    toast.success("Signed in — your details are prefilled.");
    setOpen(false);
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { token } = await login({ email: form.email, password: form.password });
      await finish(token);
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setBusy(false);
    }
  }

  async function doRegister(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { token } = await register({
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      await finish(token);
    } catch {
      toast.error("Could not register — email may already be in use.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Sign in
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Account (optional)</DialogTitle>
            <DialogDescription>
              Save your details and see past orders. Ordering without an account
              works too.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={doLogin} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" required value={form.password} onChange={set("password")} autoComplete="current-password" />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>Sign in</Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={doRegister} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input id="reg-password" type="password" required value={form.password} onChange={set("password")} autoComplete="new-password" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password2">Confirm password</Label>
                  <Input id="reg-password2" type="password" required value={form.password_confirmation} onChange={set("password_confirmation")} autoComplete="new-password" />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>Register</Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
