"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { Checkbox, CheckboxField } from "@/components/checkbox";
import { Field, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Strong, Text, TextLink } from "@/components/text";

import { api } from "@/lib/api";
import { setSessionUser } from "@/lib/session";

const enableDebugMode = false;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enableDebugMode) return;
    setEmail("test_1770855412381@gmail.com");
    setPassword("asdasd123123");
    setRemember(true);
  }, []);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            type LoginResp =
              | { ok: true; user: { 
                userId: string; 
                firstName: string; 
                lastName: string; 
                roles: string[];
              } }
              | { ok: false; error: string };

            const data = await api.post<LoginResp>("/api/login", { email, password });

            if (!data.ok) {
              setError(data.error || "Login failed");
              return;
            }

            setSessionUser(data.user);
            setDone(true);

            // optional: sanity-check the cookie works
            // await api.get("/api/session");

            router.replace(next);
        } catch (err: any) {
            setError(err?.message || "Login failed");
        } finally {
            setSubmitting(false);
        }
    }

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} className="grid w-full max-w-sm grid-cols-1 gap-4">
        <Heading>Sign in</Heading>

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
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            required
          />
        </Field>

        <CheckboxField>
          <Checkbox
            name="remember"
            checked={remember}
            onChange={(e: any) => setRemember(e.target.checked)}
          />
          <Label>Remember me</Label>
        </CheckboxField>

        {error ? (
          <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm">
            {error}
          </div>
        ) : null}

        {done ? (
          <div className="rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm">
            Signed in. Redirecting…
          </div>
        ) : null}

        <Button color="pink" type="submit" className="w-full mt-2" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>

        <Text>
          Don&apos;t have an account?{" "}
          <TextLink href={`/register?next=${encodeURIComponent(next)}`}>
            <Strong>Create one</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  );
}
