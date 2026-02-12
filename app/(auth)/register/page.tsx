"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { Checkbox, CheckboxField } from "@/components/checkbox";
import { Field, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { Strong, Text, TextLink } from "@/components/text";
import { api } from "@/lib/api";

const enableDebugMode = false;
  
export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState(""); // (currently not used by backend)
  const [lastName, setLastName] = useState(""); // (currently not used by backend)
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("United States"); // (currently not used by backend)
  const [optIn, setOptIn] = useState(false); // (currently not used by backend)

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
      if (!enableDebugMode) return;
      let ts = new Date().getTime();
      setEmail(`test_${ts}@gmail.com`);
      setFirstName("first");
      setLastName("last");
      // setPassword("1234556789^$Testing");
      setPassword("asdasd123123");
    }, []);
  
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = await api.post<{ ok: boolean; userId?: string; error?: string }>(
        "/api/register",
        { email, password, isAdmin: false, firstName, lastName }
      );

      if (!data?.ok) {
        setError(data?.error || "Register failed");
        return;
      }

      setDone(true);
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    } catch (err: any) {
      // apiFetch throws Error(msg) for non-2xx responses
      setError(err?.message || "Register failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} className="grid w-full max-w-sm grid-cols-1 gap-4">
        <Heading>Create your account</Heading>

        <Field>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field>
          <Label>First name</Label>
          <Input
            name="firstName"
            value={firstName}
            onChange={(e: any) => setFirstName(e.target.value)}
          />
        </Field>

        <Field>
          <Label>Last name</Label>
          <Input
            name="lastName"
            value={lastName}
            onChange={(e: any) => setLastName(e.target.value)}
          />
        </Field>

        <Field>
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            required
          />
        </Field>

        {/* <CheckboxField>
          <Checkbox
            name="remember"
            checked={optIn}
            onChange={(e: any) => setOptIn(e.target.checked)}
          />
          <Label>Get emails about product updates and news.</Label>
        </CheckboxField> */}

        {error ? (
          <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm">
            {error}
          </div>
        ) : null}

        {done ? (
          <div className="rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm">
            Account created. Redirecting…
          </div>
        ) : null}

        <Button color="pink" type="submit" className="w-full mt-2" disabled={submitting}>
          {submitting ? "Creating…" : "Create account"}
        </Button>

        <Text>
          Already have an account?{" "}
          <TextLink href={`/login?next=${encodeURIComponent(next)}`}>
            <Strong>Sign in</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  );
}
