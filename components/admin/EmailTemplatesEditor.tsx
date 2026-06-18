"use client";

import { useState } from "react";
import type { EmailTemplate } from "@prisma/client";
import { t } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const KEYS = ["confirm_signup", "recovery", "welcome"] as const;
const LANGS = ["fr", "en", "es"] as const;

type TemplateKey = typeof KEYS[number];
type TemplateLang = typeof LANGS[number];
type Grouped = Record<TemplateKey, Record<TemplateLang, EmailTemplate>>;

function groupTemplates(templates: EmailTemplate[]): Grouped {
  const grouped = {} as Grouped;
  for (const key of KEYS) {
    grouped[key] = {} as Record<TemplateLang, EmailTemplate>;
    for (const lang of LANGS) {
      const found = templates.find((t) => t.key === key && t.language === lang);
      if (found) grouped[key][lang] = found;
    }
  }
  return grouped;
}

type FeedbackMap = Record<number, { msg: string; isError: boolean }>;
type FormMap = Record<number, { subject: string; html: string }>;

interface Props {
  templates: EmailTemplate[];
  lang: string;
}

export default function EmailTemplatesEditor({ templates, lang }: Props) {
  const grouped = groupTemplates(templates);

  const [forms, setForms] = useState<FormMap>(() => {
    const map: FormMap = {};
    for (const tpl of templates) {
      map[tpl.id] = { subject: tpl.subject, html: tpl.html };
    }
    return map;
  });
  const [feedback, setFeedback] = useState<FeedbackMap>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  function setField(id: number, field: "subject" | "html", value: string) {
    setForms((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function setMsg(id: number, msg: string, isError = false) {
    setFeedback((prev) => ({ ...prev, [id]: { msg, isError } }));
    setTimeout(() => setFeedback((prev) => ({ ...prev, [id]: { msg: "", isError: false } })), 3000);
  }

  async function handleSave(id: number) {
    setLoading((prev) => ({ ...prev, [id]: true }));
    const { subject, html } = forms[id];

    const res = await fetch(`/api/admin/email-templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, html }),
    });
    const data = await res.json();
    setLoading((prev) => ({ ...prev, [id]: false }));

    if (!res.ok) {
      setMsg(id, t(data.error, lang), true);
    } else {
      setMsg(id, t("admin.emailTemplates.saved", lang));
    }
  }

  return (
    <Tabs defaultValue={KEYS[0]}>
      <TabsList className="mb-6 gap-2 px-2">
        {KEYS.map((key) => (
          <TabsTrigger key={key} value={key} className="px-6">
            {t(`admin.emailTemplates.types.${key}`, lang)}
          </TabsTrigger>
        ))}
      </TabsList>

      {KEYS.map((key) => (
        <TabsContent key={key} value={key}>
          <Tabs defaultValue="fr">
            <TabsList className="mb-4">
              {LANGS.map((l) => (
                <TabsTrigger key={l} value={l}>
                  {l.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>

            {LANGS.map((l) => {
              const tpl = grouped[key][l];
              if (!tpl) return (
                <TabsContent key={l} value={l}>
                  <p className="text-sm text-muted-foreground">Template introuvable en base de données.</p>
                </TabsContent>
              );
              const form = forms[tpl.id] ?? { subject: tpl.subject, html: tpl.html };
              const fb = feedback[tpl.id];

              return (
                <TabsContent key={l} value={l}>
                  <div className="space-y-4 max-w-3xl">
                    <div className="space-y-1">
                      <Label>{t("admin.emailTemplates.subject", lang)}</Label>
                      <Input
                        value={form.subject}
                        onChange={(e) => setField(tpl.id, "subject", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>{t("admin.emailTemplates.body", lang)}</Label>
                      <Textarea
                        value={form.html}
                        onChange={(e) => setField(tpl.id, "html", e.target.value)}
                        rows={14}
                        className="font-mono text-sm"
                      />
                    </div>

                    {fb?.msg && (
                      <p className={`text-sm ${fb.isError ? "text-destructive" : "text-green-600"}`}>
                        {fb.msg}
                      </p>
                    )}

                    <Button onClick={() => handleSave(tpl.id)} disabled={loading[tpl.id]}>
                      {t("admin.emailTemplates.save", lang)}
                    </Button>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </TabsContent>
      ))}
    </Tabs>
  );
}
