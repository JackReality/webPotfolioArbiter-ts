"use client";

import { useState } from "react";
import type { User } from "@prisma/client";
import { t } from "@/lib/i18n";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PurchaseInfo = {
  trainingCode: string;
  stripeSessionId: string | null;
  amountCt: number | null;
  currency: string | null;
  purchasedAt: Date;
};

type UserWithTrainings = User & { userTrainings: PurchaseInfo[] };

const ROLES = ["subscriber", "client", "moderator", "admin"];

interface Props {
  users: UserWithTrainings[];
  lang: string;
}

export default function UsersTable({ users: initial, lang }: Props) {
  const [users, setUsers] = useState(initial);
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [purchasesUser, setPurchasesUser] = useState<UserWithTrainings | null>(null);

  function setMsg(id: number, msg: string) {
    setFeedback((prev) => ({ ...prev, [id]: msg }));
    setTimeout(() => setFeedback((prev) => ({ ...prev, [id]: "" })), 3000);
  }

  async function handleRoleChange(id: number, role: string) {
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(id, t(data.error, lang));
    } else {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      setMsg(id, t("admin.users.roleUpdated", lang));
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(id, t(data.error, lang));
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.users.colName", lang)}</TableHead>
            <TableHead>{t("admin.users.colEmail", lang)}</TableHead>
            <TableHead>{t("admin.users.colRole", lang)}</TableHead>
            <TableHead>{t("admin.users.colRegistered", lang)}</TableHead>
            <TableHead>{t("admin.users.colTrainings", lang)}</TableHead>
            <TableHead>{t("admin.users.colCommunity", lang)}</TableHead>
            <TableHead>{t("admin.users.colActions", lang)}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isAdmin = user.role === "admin";
            return (
              <TableRow key={user.id}>
                <TableCell>{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {isAdmin ? (
                    <Badge variant="destructive">Admin</Badge>
                  ) : (
                    <Select
                      defaultValue={user.role}
                      onValueChange={(role) => { if (role) handleRoleChange(user.id, role); }}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.filter((r) => r !== "admin").map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {feedback[user.id] && (
                    <p className="text-xs mt-1 text-muted-foreground">{feedback[user.id]}</p>
                  )}
                </TableCell>
                <TableCell>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString(lang) : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>
                      {user.userTrainings.length > 0
                        ? user.userTrainings.map((ut) => ut.trainingCode).join(", ")
                        : "—"}
                    </span>
                    {user.userTrainings.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPurchasesUser(user)}
                      >
                        {t("admin.users.viewPurchases", lang)}
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {user.axsCommunityExpire
                    ? new Date(user.axsCommunityExpire).toLocaleDateString(lang)
                    : "—"}
                </TableCell>
                <TableCell>
                  {isAdmin ? (
                    <span className="text-xs text-muted-foreground">
                      {t("admin.users.protected", lang)}
                    </span>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Button variant="destructive" size="sm">
                          {t("admin.users.delete", lang)}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("admin.users.delete", lang)}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("admin.users.deleteConfirm", lang)}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(user.id)}>
                            {t("admin.users.delete", lang)}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={purchasesUser !== null} onOpenChange={(open) => { if (!open) setPurchasesUser(null); }}>
        <DialogContent className="w-[76%] max-w-[76%]">
          <DialogHeader>
            <DialogTitle>
              {t("admin.users.purchasesTitle", lang)} — {purchasesUser?.displayName}
            </DialogTitle>
          </DialogHeader>
          {purchasesUser && purchasesUser.userTrainings.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("admin.users.noPurchases", lang)}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.users.colPurchaseCode", lang)}</TableHead>
                  <TableHead>{t("admin.users.colAmount", lang)}</TableHead>
                  <TableHead>{t("admin.users.colCurrency", lang)}</TableHead>
                  <TableHead>{t("admin.users.colPurchaseDate", lang)}</TableHead>
                  <TableHead>{t("admin.users.colStripeId", lang)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchasesUser?.userTrainings.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{p.trainingCode}</TableCell>
                    <TableCell>
                      {p.amountCt != null ? (p.amountCt / 100).toFixed(2) : "—"}
                    </TableCell>
                    <TableCell>{p.currency ? p.currency.toUpperCase() : "—"}</TableCell>
                    <TableCell>
                      {new Date(p.purchasedAt).toLocaleDateString(lang)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.stripeSessionId ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </>
  );
}
