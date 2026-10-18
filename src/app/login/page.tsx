"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import { storeApi } from "@/lib/store-api";
import { useSession } from "@/store/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/orders";
  const { setSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your email/phone and password");
      return;
    }
    setBusy(true);
    try {
      const r = await storeApi.login({ email: email.trim(), password });
      setSession(r.user, r.accessToken);
      toast.success(`Welcome back, ${r.user.name}!`);
      router.push(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-6">
      <Card>
        <CardHeader className="text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-xl font-black text-primary-foreground">
            G
          </span>
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>One account for every GB Retail store.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email or phone</Label>
              <Input
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com or 98765…"
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</p>
            )}
            <Button type="submit" disabled={busy} className="w-full" size="lg">
              <LogIn className="h-4 w-4" /> {busy ? "Logging in…" : "Login"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link
                href={`/register?next=${encodeURIComponent(next)}`}
                className="font-bold text-primary hover:underline"
              >
                Create account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md space-y-3 py-6"><Skeleton className="h-64 w-full" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
