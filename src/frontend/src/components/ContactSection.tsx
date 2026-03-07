import { Instagram, Mail, Phone } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSiteContentMap } from "../hooks/useQueries";

export function ContactSection() {
  const content = useSiteContentMap();
  const sectionRef = useRef<HTMLElement>(null);

  const title = content.contactSectionTitle ?? "Get In Touch";
  const instagram = content.contactInstagram ?? "@varun1627";
  const email = content.contactEmail ?? "hello@varun1627.com";
  const phone = content.contactPhone ?? "+91 00000 00000";

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            for (const el of entry.target.querySelectorAll(".reveal")) {
              el.classList.add("visible");
            }
          }
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const instagramHandle = instagram.replace(/^@/, "");
  const emailHref = `mailto:${email}`;
  const phoneHref = `tel:${phone.replace(/\s+/g, "")}`;

  const contacts = [
    {
      icon: Instagram,
      label: "Instagram",
      value: instagram,
      href: `https://instagram.com/${instagramHandle}`,
      description: "Follow my work",
    },
    {
      icon: Mail,
      label: "Email",
      value: email,
      href: emailHref,
      description: "Write to me",
    },
    {
      icon: Phone,
      label: "Phone",
      value: phone,
      href: phoneHref,
      description: "Call or WhatsApp",
    },
  ];

  return (
    <section id="contact" ref={sectionRef} className="relative z-10 py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="reveal mb-4 inline-flex items-center gap-2 text-cyan text-xs font-medium tracking-[0.2em] uppercase">
            <span className="w-8 h-px bg-cyan" />
            Contact
            <span className="w-8 h-px bg-cyan" />
          </div>
          <h2 className="reveal font-display font-black text-4xl md:text-6xl tracking-tight text-foreground mb-4">
            {title}
          </h2>
          <p className="reveal text-muted-foreground text-lg leading-relaxed">
            Available for freelance projects and collaborations worldwide.
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contacts.map((contact, i) => {
            const Icon = contact.icon;
            return (
              <a
                key={contact.label}
                href={contact.href}
                target={contact.label === "Instagram" ? "_blank" : undefined}
                rel={
                  contact.label === "Instagram"
                    ? "noopener noreferrer"
                    : undefined
                }
                className={`reveal reveal-delay-${i + 1} group block p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan/30 hover:bg-cyan/5 transition-all duration-300 text-center hover:shadow-glow-sm hover:-translate-y-1`}
                data-ocid={`contact.${contact.label.toLowerCase()}.link`}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-cyan/20 group-hover:shadow-glow-sm transition-all duration-300">
                  <Icon size={24} className="text-cyan" />
                </div>

                {/* Label */}
                <div className="text-xs font-medium text-muted-foreground tracking-[0.15em] uppercase mb-2">
                  {contact.description}
                </div>

                {/* Value */}
                <div className="font-semibold text-foreground text-sm group-hover:text-cyan transition-colors duration-200 break-all">
                  {contact.value}
                </div>
              </a>
            );
          })}
        </div>

        {/* Availability badge */}
        <div className="reveal mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Available for new projects
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
