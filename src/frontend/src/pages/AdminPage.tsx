import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2, Lock, ShieldOff } from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { CategoriesManager } from "../components/admin/CategoriesManager";
import { SiteContentEditor } from "../components/admin/SiteContentEditor";
import { VideosManager } from "../components/admin/VideosManager";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";
import { storeSessionParameter } from "../utils/urlParams";

type AdminSection = "content" | "categories" | "videos";

// Token entry states — all three values are valid render-time states
type TokenState = "idle" | "submitting" | "error";
const IS_SUBMITTING = "submitting" as const;

export function AdminPage() {
  const { identity, login, isLoggingIn, isInitializing, clear } =
    useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const [activeSection, setActiveSection] = useState<AdminSection>("content");

  const [tokenValue, setTokenValue] = useState("");
  const [tokenState, setTokenState] = useState<TokenState>("idle");

  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoading = isInitializing || adminLoading;

  async function handleTokenSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tokenValue.trim()) return;

    setTokenState("submitting");

    // Store token in sessionStorage so the actor's getSecretParameter() finds it
    storeSessionParameter("caffeineAdminToken", tokenValue.trim());

    // Force-remove the actor query so it rebuilds from scratch with the new token
    // (staleTime: Infinity means invalidate alone won't trigger a refetch)
    await queryClient.removeQueries({ queryKey: ["actor"] });
    // Also blow away dependent queries so they re-run with the fresh actor
    await queryClient.invalidateQueries();
    await queryClient.refetchQueries({ queryKey: ["actor"] });

    // Wait briefly for React Query to propagate the new actor + isAdmin result
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Re-fetch isAdmin explicitly to pick up the new actor result
    await queryClient.refetchQueries({ queryKey: ["isAdmin"] });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check whether admin access was granted
    const cached = queryClient.getQueryData<boolean>(["isAdmin"]);
    if (!cached) {
      setTokenState("error");
    } else {
      setTokenState("idle");
    }
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan/10 border border-cyan/20 flex items-center justify-center mx-auto mb-6">
            <Lock size={24} className="text-cyan" />
          </div>
          <h1 className="font-display font-black text-3xl text-foreground mb-2">
            Admin Access
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in with Internet Identity to access the admin panel.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-cyan text-navy-deep hover:bg-cyan/90 font-semibold h-12"
            data-ocid="admin.login.button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          <div className="mt-4">
            <a
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to portfolio
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <div
          className="flex flex-col items-center gap-4 text-muted-foreground"
          data-ocid="admin.loading_state"
        >
          <Loader2 size={32} className="animate-spin text-cyan" />
          <p className="text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Logged in but not admin — show token entry form
  if (isAdmin === false) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full" data-ocid="admin.token.panel">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan/10 border border-cyan/20 flex items-center justify-center">
              <ShieldOff size={24} className="text-cyan" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-2xl text-foreground mb-2">
              Admin Access Required
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your account doesn't have admin access yet. Enter your Caffeine
              admin token below to claim admin rights for this site.
            </p>
          </div>

          {/* Token form */}
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div className="relative">
              <KeyRound
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                type="password"
                placeholder="Enter admin token"
                value={tokenValue}
                onChange={(e) => {
                  setTokenValue(e.target.value);
                  if (tokenState === "error") setTokenState("idle");
                }}
                className={[
                  "pl-9 h-12 bg-white/5 border-white/10 text-foreground",
                  "placeholder:text-muted-foreground/60 focus-visible:ring-cyan/40",
                  "focus-visible:border-cyan/50",
                  tokenState === "error" ? "border-red-500/60" : "",
                ].join(" ")}
                disabled={tokenState === IS_SUBMITTING}
                data-ocid="admin.token.input"
                autoComplete="off"
              />
            </div>

            {/* Error message */}
            {tokenState === "error" && (
              <p
                className="text-red-400 text-xs flex items-center gap-1.5"
                data-ocid="admin.token.error_state"
              >
                <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                Invalid token. Please check your Caffeine project settings and
                try again.
              </p>
            )}

            <Button
              type="submit"
              disabled={!tokenValue.trim() || tokenState === IS_SUBMITTING}
              className="w-full bg-cyan text-navy-deep hover:bg-cyan/90 font-semibold h-12 disabled:opacity-50"
              data-ocid="admin.token.submit_button"
            >
              {tokenState === IS_SUBMITTING ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Claim Admin Access"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-muted-foreground/50">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Sign out + back */}
          <div className="space-y-3">
            <Button
              onClick={() => clear()}
              variant="outline"
              className="w-full border-white/10 text-foreground hover:bg-white/5 font-semibold h-11"
              data-ocid="admin.signout.button"
            >
              Sign Out
            </Button>
            <div className="text-center">
              <a
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="admin.back.link"
              >
                ← Back to portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {activeSection === "content" && <SiteContentEditor />}
      {activeSection === "categories" && <CategoriesManager />}
      {activeSection === "videos" && <VideosManager />}
    </AdminLayout>
  );
}
