import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { CategoriesManager } from "../components/admin/CategoriesManager";
import { SiteContentEditor } from "../components/admin/SiteContentEditor";
import { VideosManager } from "../components/admin/VideosManager";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

type AdminSection = "content" | "categories" | "videos";

export function AdminPage() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const [activeSection, setActiveSection] = useState<AdminSection>("content");

  const isAuthenticated = !!identity;
  const isLoading = isInitializing || adminLoading;

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

  // Not admin
  if (isAdmin === false) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={24} className="text-destructive" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Your account doesn't have admin privileges.
          </p>
          <a
            href="/"
            className="text-sm text-cyan hover:text-cyan/80 transition-colors"
          >
            ← Back to portfolio
          </a>
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
