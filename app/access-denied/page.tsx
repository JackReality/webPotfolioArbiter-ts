import { getLang } from "@/lib/getLang";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default async function AccessDeniedPage() {
  const lang = await getLang();
  void lang;
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-3xl font-bold">Accès refusé</h1>
      <p className="text-muted-foreground">Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>Retour à l&apos;accueil</Link>
    </div>
  );
}
