import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Video,
  X,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

type AdminSection = "content" | "categories" | "videos";

interface AdminLayoutProps {
  children: ReactNode;
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const navItems = [
  { id: "content" as AdminSection, label: "Site Content", icon: FileText },
  { id: "categories" as AdminSection, label: "Categories", icon: Layers },
  { id: "videos" as AdminSection, label: "Videos", icon: Video },
];

export function AdminLayout({
  children,
  activeSection,
  onSectionChange,
}: AdminLayoutProps) {
  const { clear, identity } = useInternetIdentity();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const principal = `${identity?.getPrincipal().toString().slice(0, 12)}...`;

  return (
    <div className="admin-layout dark">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 glass-dark border-r border-white/10 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center">
              <LayoutDashboard size={16} className="text-cyan" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-foreground">
                Admin Panel
              </p>
              <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                {principal}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSectionChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-cyan/10 text-cyan border border-cyan/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
                data-ocid={`admin.${item.id}.tab`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  {item.label}
                </div>
                {isActive && <ChevronRight size={14} />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clear();
              window.location.href = "/";
            }}
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
            data-ocid="admin.logout.button"
          >
            <LogOut size={14} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/60 z-30 lg:hidden w-full h-full"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass-dark border-b border-white/10 px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-foreground"
            onClick={() => setSidebarOpen(true)}
            data-ocid="admin.menu.toggle"
          >
            <Menu size={18} />
          </Button>

          <div className="flex-1">
            <h1 className="font-display font-bold text-lg text-foreground">
              {navItems.find((n) => n.id === activeSection)?.label}
            </h1>
          </div>

          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← View Site
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
