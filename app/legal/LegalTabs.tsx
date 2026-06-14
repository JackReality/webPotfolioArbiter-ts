"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

const CONTACT_EMAIL = "contact@realityexplorer.com";

type Article = { title: string; content: string };

interface LegalData {
  tabs: { cgv: string; privacy: string; mentions: string };
  cgv: { title: string; articles: Article[] };
  privacy: { title: string; intro?: string; articles: Article[] };
  mentions: { title: string; articles: Article[] };
}

function RevealEmail({ lang }: { lang: string }) {
  const [shown, setShown] = useState(false);
  return shown ? (
    <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
      {CONTACT_EMAIL}
    </a>
  ) : (
    <button
      onClick={() => setShown(true)}
      className="underline text-muted-foreground hover:text-foreground transition-colors text-sm"
    >
      {t("legal.showEmail", lang)}
    </button>
  );
}

function ArticleContent({ content, lang }: { content: string; lang: string }) {
  if (!content.includes("{{email}}")) {
    return <p className="text-muted-foreground text-sm whitespace-pre-line">{content}</p>;
  }
  const parts = content.split("{{email}}");
  return (
    <p className="text-muted-foreground text-sm whitespace-pre-line">
      {parts[0]}
      <RevealEmail lang={lang} />
      {parts[1]}
    </p>
  );
}

function ArticleList({ articles, lang }: { articles: Article[]; lang: string }) {
  return (
    <div className="space-y-6">
      {articles.map((a, i) => (
        <div key={i}>
          <h3 className="font-semibold text-foreground mb-2">{a.title}</h3>
          <ArticleContent content={a.content} lang={lang} />
        </div>
      ))}
    </div>
  );
}

export default function LegalTabs({ legal, lang }: { legal: LegalData; lang: string }) {
  const tabs = [
    { value: "cgv", label: legal.tabs.cgv },
    { value: "privacy", label: legal.tabs.privacy },
    { value: "mentions", label: legal.tabs.mentions },
  ];

  const [active, setActive] = useState("cgv");

  return (
    <>
      {/* Onglets */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActive(tab.value)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              active === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {active === "cgv" && (
        <div>
          <h2 className="text-xl font-semibold mb-6">{legal.cgv.title}</h2>
          <ArticleList articles={legal.cgv.articles} lang={lang} />
        </div>
      )}

      {active === "privacy" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">{legal.privacy.title}</h2>
          {legal.privacy.intro && (
            <p className="text-muted-foreground text-sm mb-6">{legal.privacy.intro}</p>
          )}
          <ArticleList articles={legal.privacy.articles} lang={lang} />
        </div>
      )}

      {active === "mentions" && (
        <div>
          <h2 className="text-xl font-semibold mb-6">{legal.mentions.title}</h2>
          <ArticleList articles={legal.mentions.articles} lang={lang} />
        </div>
      )}
    </>
  );
}
