"use client";

import { useState } from "react";
import type { Training } from "@prisma/client";
import { t } from "@/lib/i18n";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const LANGS = ["fr", "en", "es"];

type FormData = {
  title: string;
  code: string;
  language: string;
  descriptionHtml: string;
  stripeProductId: string;
  stripePriceId: string;
  confirmationEmailHtml: string;
  privatePageUrl: string;
  publicPageUrl: string;
  isFree: boolean;
  allowRepurchase: boolean;
  axsCommunityMonths: string;
};

const EMPTY_FORM: FormData = {
  title: "", code: "", language: "fr", descriptionHtml: "",
  stripeProductId: "", stripePriceId: "", confirmationEmailHtml: "",
  privatePageUrl: "", publicPageUrl: "", isFree: false, allowRepurchase: false, axsCommunityMonths: "",
};

function trainingToForm(tr: Training): FormData {
  return {
    title: tr.title,
    code: tr.code,
    language: tr.language,
    descriptionHtml: tr.descriptionHtml,
    stripeProductId: tr.stripeProductId ?? "",
    stripePriceId: tr.stripePriceId ?? "",
    confirmationEmailHtml: tr.confirmationEmailHtml ?? "",
    privatePageUrl: tr.privatePageUrl ?? "",
    publicPageUrl: tr.publicPageUrl ?? "",
    isFree: tr.isFree,
    allowRepurchase: tr.allowRepurchase,
    axsCommunityMonths: tr.axsCommunityMonths != null ? String(tr.axsCommunityMonths) : "",
  };
}

interface Props {
  trainings: Training[];
  lang: string;
}

export default function TrainingsTable({ trainings: initial, lang }: Props) {
  const [trainings, setTrainings] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setOpen(true);
  }

  async function openEdit(tr: Training) {
    setEditingId(tr.id);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/admin/trainings/${tr.id}`);
    const data = await res.json();
    setForm(trainingToForm(data));
    setOpen(true);
  }

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      title: form.title,
      code: form.code,
      language: form.language,
      descriptionHtml: form.descriptionHtml,
      stripeProductId: form.stripeProductId || null,
      stripePriceId: form.stripePriceId || null,
      confirmationEmailHtml: form.confirmationEmailHtml || null,
      privatePageUrl: form.privatePageUrl || null,
      publicPageUrl: form.publicPageUrl || null,
      isFree: form.isFree,
      allowRepurchase: form.allowRepurchase,
      axsCommunityMonths: form.axsCommunityMonths ? Number(form.axsCommunityMonths) : null,
    };

    const isAdd = editingId === null;
    const url = isAdd ? "/api/admin/trainings" : `/api/admin/trainings/${editingId}`;
    const method = isAdd ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(t(data.error, lang));
      return;
    }

    setSuccess(t(isAdd ? "admin.trainings.added" : "admin.trainings.saved", lang));

    if (isAdd) {
      // Recharger la page pour avoir l'id généré
      window.location.reload();
    } else {
      setTrainings((prev) =>
        prev.map((tr) =>
          tr.id === editingId
            ? { ...tr, ...payload, code: tr.code, id: tr.id, createdAt: tr.createdAt }
            : tr
        )
      );
      setTimeout(() => setOpen(false), 800);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd}>{t("admin.trainings.add", lang)}</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.trainings.colCode", lang)}</TableHead>
            <TableHead>{t("admin.trainings.colTitle", lang)}</TableHead>
            <TableHead>{t("admin.trainings.colLang", lang)}</TableHead>
            <TableHead>{t("admin.trainings.colPageUrl", lang)}</TableHead>
            <TableHead>{t("admin.trainings.colCommunity", lang)}</TableHead>
            <TableHead>{t("admin.trainings.colActions", lang)}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trainings.map((tr) => (
            <TableRow key={tr.id}>
              <TableCell className="font-mono text-sm">{tr.code}</TableCell>
              <TableCell>{tr.title}</TableCell>
              <TableCell>{tr.language.toUpperCase()}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{tr.privatePageUrl ?? "—"}</TableCell>
              <TableCell>{tr.axsCommunityMonths ?? "—"}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => openEdit(tr)}>
                  {t("admin.trainings.edit", lang)}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[75vw] max-w-[75vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId === null
                ? t("admin.trainings.addTitle", lang)
                : t("admin.trainings.editTitle", lang)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {editingId === null ? (
              <div className="space-y-1">
                <Label>{t("admin.trainings.fieldCode", lang)}</Label>
                <Input
                  value={form.code}
                  onChange={(e) => set("code", e.target.value)}
                  placeholder="ex: PORTFOLIO"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <Label>{t("admin.trainings.fieldCode", lang)}</Label>
                <p className="text-sm font-mono font-semibold">{form.code}</p>
              </div>
            )}
            <div className="space-y-1">
              <Label>{t("admin.trainings.fieldTitle", lang)}</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{t("admin.trainings.fieldLang", lang)}</Label>
              <Select value={form.language ?? ""} onValueChange={(v) => set("language", v ?? "")}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGS.map((l) => (
                    <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t("admin.trainings.fieldDescHtml", lang)}</Label>
              <Textarea
                value={form.descriptionHtml}
                onChange={(e) => set("descriptionHtml", e.target.value)}
                rows={5}
              />
            </div>
            <div className="space-y-1">
              <Label>{t("admin.trainings.fieldPublicPageUrl", lang)}</Label>
              <Input value={form.publicPageUrl} onChange={(e) => set("publicPageUrl", e.target.value)} placeholder="ex: /formation/portfolio" />
            </div>
            <div className="space-y-1">
              <Label>{t("admin.trainings.fieldPrivatePageUrl", lang)}</Label>
              <Input value={form.privatePageUrl} onChange={(e) => set("privatePageUrl", e.target.value)} placeholder="ex: /training_portfolio" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFree"
                checked={form.isFree}
                onChange={(e) => setForm((prev) => ({
                  ...prev,
                  isFree: e.target.checked,
                  allowRepurchase: e.target.checked ? false : prev.allowRepurchase,
                }))}
                className="h-4 w-4"
              />
              <Label htmlFor="isFree">{t("admin.trainings.fieldIsFree", lang)}</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowRepurchase"
                checked={form.allowRepurchase}
                onChange={(e) => setForm((prev) => ({ ...prev, allowRepurchase: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="allowRepurchase">{t("admin.trainings.fieldAllowRepurchase", lang)}</Label>
            </div>
            <div className="space-y-1">
              <Label>{t("admin.trainings.fieldCommunityMonths", lang)}</Label>
              <Input
                type="number"
                min={1}
                max={120}
                value={form.axsCommunityMonths}
                onChange={(e) => set("axsCommunityMonths", e.target.value)}
                placeholder="ex: 3"
              />
            </div>
            <div className="space-y-1">
              <Label>{t("admin.trainings.fieldStripeProduct", lang)}</Label>
              <Input value={form.stripeProductId} onChange={(e) => set("stripeProductId", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{t("admin.trainings.fieldStripePrice", lang)}</Label>
              <Input value={form.stripePriceId} onChange={(e) => set("stripePriceId", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{t("admin.trainings.fieldConfirmEmail", lang)}</Label>
              <Textarea
                value={form.confirmationEmailHtml}
                onChange={(e) => set("confirmationEmailHtml", e.target.value)}
                rows={5}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("admin.trainings.cancel", lang)}
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {t("admin.trainings.save", lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
