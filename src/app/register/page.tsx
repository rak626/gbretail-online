"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { storeApi } from "@/lib/store-api";
import { useSession } from "@/store/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/orders";
  const { setSession } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Cross-shop dedup dialog state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkCustomer, setLinkCustomer] = useState<{ id: string; name: string; phone: string; shopId: string } | null>(null);
  const [linkOtherShop, setLinkOtherShop] = useState<{ id: string; name: string; code: string } | null>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !email.trim() || !password) {
      setError("Name, phone, email and password are required");
      return;
    }
    setBusy(true);
    try {
      const r = await storeApi.register({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        address: address.trim() || undefined,
      });
      setSession(r.user, r.accessToken);
      toast.success(`Account created — welcome, ${r.user.name}!`);
      router.push(next);
    } catch (err) {
      const storeErr = err as { status?: number; code?: string; customer?: { id: string; name: string; phone: string; shopId: string }; otherShop?: { id: string; name: string; code: string } | null; message?: string };
      if (storeErr.code === "PHONE_TAKEN_CROSS_SHOP") {
        setLinkCustomer(storeErr.customer ?? null);
        setLinkOtherShop(storeErr.otherShop ?? null);
        setLinkDialogOpen(true);
        return;
      }
      setError(storeErr.message ?? "Registration failed");
      toast.error(storeErr.message ?? "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleLinkAndRegister() {
    setBusy(true);
    setLinkDialogOpen(false);
    try {
      const r = await storeApi.register({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        address: address.trim() || undefined,
        confirmLink: true,
      });
      setSession(r.user, r.accessToken);
      toast.success(`Account linked and created — welcome, ${r.user.name}!`);
      router.push(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Link failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateSeparate() {
    setBusy(true);
    setLinkDialogOpen(false);
    // Re-submit with confirmLink to create a separate online account despite existing POS customer
    try {
      const r = await storeApi.register({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        address: address.trim() || undefined,
        confirmLink: true,
      });
      setSession(r.user, r.accessToken);
      toast.success(`Account created — welcome, ${r.user.name}!`);
      router.push(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
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
          <CardTitle className="text-xl">Create account</CardTitle>
          <CardDescription>
            One account for every store. Same phone as in-shop purchases links your POS history automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name">Full name</Label>
                <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Asha Kumar" autoComplete="name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-phone">Phone</Label>
                <Input id="reg-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" inputMode="tel" autoComplete="tel" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Email</Label>
              <Input id="reg-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-address">Address <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input id="reg-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House no, street…" autoComplete="street-address" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Password (min 6)</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
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
              <UserPlus className="h-4 w-4" /> {busy ? "Creating…" : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Have an account?{" "}
              <Link href="/login" className="font-bold text-primary hover:underline">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Cross-shop dedup dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Customer exists at another shop
            </DialogTitle>
            <DialogDescription>
              A POS customer with this phone already exists at{" "}
              <span className="font-semibold">{linkOtherShop?.name ?? "another shop"}</span> ({linkOtherShop?.code ?? ""}).
              Your in-shop purchases and khata history live there.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-3 border border-muted/20">
              <p className="text-sm font-medium">{linkCustomer?.name}</p>
              <p className="text-xs text-muted-foreground">{linkCustomer?.phone} • Shop: {linkOtherShop?.name}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Choose how to proceed:
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLinkDialogOpen(false)} size="sm" className="flex-1">
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleCreateSeparate} size="sm" className="flex-1">
                Create separate account
              </Button>
              <Button onClick={handleLinkAndRegister} size="sm" className="flex-1">
                Link to existing customer
              </Button>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)} size="sm">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md space-y-3 py-6"><Skeleton className="h-96 w-full" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
