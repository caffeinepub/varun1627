import { useSiteContentMap } from "../hooks/useQueries";

export function Footer() {
  const content = useSiteContentMap();
  const footerText =
    content.footerText ??
    `© ${new Date().getFullYear()} Varun 1627. All rights reserved.`;

  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="relative z-10 py-10 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>{footerText}</p>
        <p>
          © {currentYear}. Built with <span className="text-red-400">♥</span>{" "}
          using{" "}
          <a
            href={caffeineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan/70 hover:text-cyan transition-colors duration-200"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
