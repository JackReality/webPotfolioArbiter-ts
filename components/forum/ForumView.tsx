"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import SubjectCard, { type SubjectData } from "./SubjectCard";
import SuiviTab from "./SuiviTab";
import PourMoiTab from "./PourMoiTab";
import RechercheTab from "./RechercheTab";

type Props = {
  subjects: SubjectData[];
  lastDate: string | null;
  lang: string;
  userId: number;
  userRole: string;
  displayName: string;
  isMod: boolean;
};

export default function ForumView({ subjects, lastDate, lang, userId, userRole, displayName, isMod }: Props) {
  const router = useRouter();
  const [archives, setArchives] = useState<SubjectData[] | null>(null);
  const [loadingArchives, setLoadingArchives] = useState(false);
  const [suiviKey, setSuiviKey] = useState(0);
  const [pourMoiKey, setPourMoiKey] = useState(0);
  const [biffeKey, setBiffeKey] = useState(0);

  async function loadArchives(force = false) {
    if (archives !== null && !force) return;
    setLoadingArchives(true);
    const res = await fetch("/api/forum/subjects?filter=archived");
    const data = await res.json();
    setArchives(Array.isArray(data) ? data : []);
    setLoadingArchives(false);
  }

  function reloadArchives() { loadArchives(true); }

  function handleTabChange(value: string) {
    if (value === "forum") router.refresh();
    if (value === "suivi") setSuiviKey((k) => k + 1);
    if (value === "pour-moi") setPourMoiKey((k) => k + 1);
    if (value === "archives") reloadArchives();
    if (value === "biffe") setBiffeKey((k) => k + 1);
  }

  return (
    <Tabs defaultValue="forum" onValueChange={handleTabChange}>
      <TabsList className="h-auto p-1 gap-1 mb-0">
        <TabsTrigger value="forum" className="px-6 py-2">{t("forum.tabForum", lang)}</TabsTrigger>
        <TabsTrigger value="suivi" className="px-6 py-2">{t("forum.tabSuivi", lang)}</TabsTrigger>
        <TabsTrigger value="pour-moi" className="px-6 py-2">{t("forum.tabPourMoi", lang)}</TabsTrigger>
        <TabsTrigger value="recherche" className="px-6 py-2">{t("forum.tabRecherche", lang)}</TabsTrigger>
        <TabsTrigger value="archives" className="px-6 py-2">{t("forum.tabArchives", lang)}</TabsTrigger>
        {isMod && (
          <TabsTrigger value="biffe" className="px-6 py-2">{t("forum.tabBiffe", lang)}</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="forum" className="border rounded-b-lg rounded-tr-lg p-6 space-y-4 mt-0">
        <div className="flex justify-end">
          <Link href="/community/new" className={buttonVariants({ size: "sm" })}>
            {t("forum.newSubject", lang)}
          </Link>
        </div>
        {subjects.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">{t("forum.noSubjects", lang)}</p>
        )}
        {subjects.map((s) => (
          <SubjectCard
            key={s.id}
            subject={s}
            userId={userId}
            userRole={userRole}
            displayName={displayName}
            isMod={isMod}
            lang={lang}
          />
        ))}
      </TabsContent>

      <TabsContent value="suivi" className="border rounded-b-lg rounded-tr-lg p-6 mt-0">
        <SuiviTab
          initialDate={lastDate}
          suiviKey={suiviKey}
          lang={lang}
          userId={userId}
          userRole={userRole}
          displayName={displayName}
          isMod={isMod}
        />
      </TabsContent>

      <TabsContent value="archives" className="border rounded-b-lg rounded-tr-lg p-6 space-y-4 mt-0">
        {loadingArchives && (
          <p className="text-sm text-muted-foreground py-4">{t("common.loading", lang)}</p>
        )}
        {!loadingArchives && archives !== null && archives.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">{t("forum.archivesEmpty", lang)}</p>
        )}
        {(archives ?? []).map((s) => (
          <SubjectCard
            key={s.id}
            subject={s}
            userId={userId}
            userRole={userRole}
            displayName={displayName}
            isMod={isMod}
            lang={lang}
            readOnly
            onRefreshList={reloadArchives}
          />
        ))}
      </TabsContent>

      <TabsContent value="pour-moi" className="border rounded-b-lg rounded-tr-lg p-6 mt-0">
        <PourMoiTab
          key={pourMoiKey}
          lang={lang}
          userId={userId}
          userRole={userRole}
          displayName={displayName}
          isMod={isMod}
        />
      </TabsContent>

      <TabsContent value="recherche" className="border rounded-b-lg rounded-tr-lg p-6 mt-0">
        <RechercheTab
          lang={lang}
          userId={userId}
          userRole={userRole}
          displayName={displayName}
          isMod={isMod}
        />
      </TabsContent>

      {isMod && (
        <TabsContent value="biffe" className="border rounded-b-lg rounded-tr-lg p-6 space-y-4 mt-0">
          {biffeKey > 0 && <BiffeTab key={biffeKey} lang={lang} userId={userId} isMod={isMod} userRole={userRole} displayName={displayName} />}
        </TabsContent>
      )}
    </Tabs>
  );
}

function BiffeTab({ lang, userId, isMod, userRole, displayName }: { lang: string; userId: number; isMod: boolean; userRole: string; displayName: string }) {
  const [subjects, setSubjects] = useState<SubjectData[] | null>(null);
  const [loading, setLoading] = useState(true);

  function fetchList() {
    setLoading(true);
    fetch("/api/forum/subjects?filter=hidden")
      .then((r) => r.json())
      .then((data) => setSubjects(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchList(); }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground py-4">{t("common.loading", lang)}</p>;
  }

  if (!subjects || subjects.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">{t("forum.biffeEmpty", lang)}</p>;
  }

  return (
    <div className="space-y-3">
      {subjects.map((s) => (
        <SubjectCard
          key={s.id}
          subject={s}
          userId={userId}
          userRole={userRole}
          displayName={displayName}
          isMod={isMod}
          lang={lang}
          readOnly
          onRefreshList={fetchList}
        />
      ))}
    </div>
  );
}
