import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSiteContentMap } from "../hooks/useQueries";

export function Navbar() {
  const content = useSiteContentMap();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const brand = content.navbarBrand ?? "Varun 1627";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-dark py-3 shadow-cinematic" : "py-5 bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand */}
        <button
          type="button"
          onClick={() => scrollTo("hero")}
          className="font-display font-bold text-xl tracking-tight text-foreground hover:text-cyan transition-colors duration-200 cursor-pointer"
          data-ocid="nav.link"
        >
          {brand}
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Work", id: "work" },
            { label: "About", id: "about" },
            { label: "Contact", id: "contact" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 tracking-wide cursor-pointer"
              data-ocid={`nav.${item.id}.link`}
            >
              {item.label}
            </button>
          ))}
          <a
            href="/admin"
            className="text-sm font-medium text-cyan/70 hover:text-cyan transition-colors duration-200 tracking-wide"
            data-ocid="nav.admin.link"
          >
            Admin
          </a>
        </div>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-foreground"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          data-ocid="nav.toggle"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden glass-dark border-t border-border/30 px-6 py-4 flex flex-col gap-4">
          {[
            { label: "Work", id: "work" },
            { label: "About", id: "about" },
            { label: "Contact", id: "contact" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className="text-left text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 py-1"
              data-ocid={`nav.mobile.${item.id}.link`}
            >
              {item.label}
            </button>
          ))}
          <a
            href="/admin"
            className="text-base font-medium text-cyan/70 hover:text-cyan py-1"
            data-ocid="nav.mobile.admin.link"
          >
            Admin
          </a>
        </div>
      )}
    </header>
  );
}
