import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSetSiteContent, useSiteContent } from "../../hooks/useQueries";

const CONTENT_KEYS: {
  key: string;
  label: string;
  type: "input" | "textarea";
  hint?: string;
}[] = [
  { key: "navbarBrand", label: "Navbar Brand Name", type: "input" },
  {
    key: "heroTitle",
    label: "Hero Title",
    type: "input",
    hint: "The large brand name in the hero section",
  },
  {
    key: "heroTagline",
    label: "Hero Tagline",
    type: "textarea",
    hint: "Subtitle below the hero title",
  },
  { key: "workSectionTitle", label: "Work Section Title", type: "input" },
  {
    key: "workSectionSubtitle",
    label: "Work Section Subtitle",
    type: "textarea",
  },
  { key: "aboutSectionTitle", label: "About Section Title", type: "input" },
  {
    key: "aboutBio",
    label: "About Bio",
    type: "textarea",
    hint: "Your professional bio paragraph",
  },
  { key: "contactSectionTitle", label: "Contact Section Title", type: "input" },
  {
    key: "contactInstagram",
    label: "Instagram Handle",
    type: "input",
    hint: "e.g. @varun1627",
  },
  { key: "contactEmail", label: "Email Address", type: "input" },
  {
    key: "contactPhone",
    label: "Phone Number",
    type: "input",
    hint: "e.g. +91 98765 43210",
  },
  { key: "footerText", label: "Footer Text", type: "input" },
];

export function SiteContentEditor() {
  const { data: contents = [], isLoading } = useSiteContent();
  const setSiteContent = useSetSiteContent();
  const [values, setValues] = useState<Record<string, string>>({});
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  // Initialize values from loaded content
  useEffect(() => {
    if (contents.length > 0) {
      const map: Record<string, string> = {};
      for (const item of contents) {
        map[item.key] = item.value;
      }
      setValues(map);
    }
  }, [contents]);

  const handleSave = async (key: string) => {
    try {
      await setSiteContent.mutateAsync({ key, value: values[key] ?? "" });
      setSavedKeys((prev) => new Set([...prev, key]));
      setTimeout(() => {
        setSavedKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 2000);
      toast.success("Saved successfully");
    } catch (_err) {
      toast.error("Failed to save. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-ocid="content.loading_state">
        {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((id) => (
          <Skeleton key={id} className="h-16 rounded-lg bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <p className="text-muted-foreground text-sm">
        Edit the text content displayed across your portfolio site. Changes are
        saved individually.
      </p>

      {CONTENT_KEYS.map((field) => (
        <div
          key={field.key}
          className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <Label className="font-medium text-foreground text-sm">
                {field.label}
              </Label>
              {field.hint && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {field.hint}
                </p>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => handleSave(field.key)}
              disabled={setSiteContent.isPending}
              className={`shrink-0 transition-all duration-200 ${
                savedKeys.has(field.key)
                  ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                  : "bg-cyan/10 text-cyan border-cyan/20 hover:bg-cyan/20"
              } border`}
              variant="outline"
              data-ocid={`content.${field.key}.save_button`}
            >
              {setSiteContent.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : savedKeys.has(field.key) ? (
                <>
                  <Check size={14} className="mr-1" />
                  Saved
                </>
              ) : (
                <>
                  <Save size={14} className="mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>

          {field.type === "textarea" ? (
            <Textarea
              value={values[field.key] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              className="bg-white/5 border-white/10 text-foreground resize-none min-h-[80px]"
              data-ocid={`content.${field.key}.textarea`}
            />
          ) : (
            <Input
              value={values[field.key] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              className="bg-white/5 border-white/10 text-foreground"
              data-ocid={`content.${field.key}.input`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
