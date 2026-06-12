import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import fr from "@/lib/locales/fr.json";
import en from "@/lib/locales/en.json";
import es from "@/lib/locales/es.json";

type Article = { title: string; content: string };
type LegalSection = { title: string; articles: Article[]; intro?: string };

function getLocale(lang: string) {
  if (lang === "en") return en;
  if (lang === "es") return es;
  return fr;
}

function ArticleList({ articles }: { articles: Article[] }) {
  return (
    <div className="space-y-6">
      {articles.map((a, i) => (
        <div key={i}>
          <h3 className="font-semibold text-foreground mb-2">{a.title}</h3>
          <p className="text-muted-foreground text-sm whitespace-pre-line">{a.content}</p>
        </div>
      ))}
    </div>
  );
}

export default async function LegalPage() {
  const lang = await getLang();
  const locale = getLocale(lang);
  const legal = locale.legal;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">{legal.title}</h1>
      <p className="text-muted-foreground mb-8 text-sm">{legal.intro}</p>

      <Tabs defaultValue="cgv">
        <TabsList className="mb-6">
          <TabsTrigger value="cgv">{legal.tabs.cgv}</TabsTrigger>
          <TabsTrigger value="privacy">{legal.tabs.privacy}</TabsTrigger>
          <TabsTrigger value="mentions">{legal.tabs.mentions}</TabsTrigger>
        </TabsList>

        <TabsContent value="cgv">
          <h2 className="text-xl font-semibold mb-6">{legal.cgv.title}</h2>
          <ArticleList articles={legal.cgv.articles} />
        </TabsContent>

        <TabsContent value="privacy">
          <h2 className="text-xl font-semibold mb-2">{legal.privacy.title}</h2>
          <p className="text-muted-foreground text-sm mb-6">{legal.privacy.intro}</p>
          <ArticleList articles={legal.privacy.articles} />
        </TabsContent>

        <TabsContent value="mentions">
          <h2 className="text-xl font-semibold mb-6">{legal.mentions.title}</h2>
          <ArticleList articles={legal.mentions.articles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
