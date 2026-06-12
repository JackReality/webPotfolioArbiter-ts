import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-6xl font-bold text-muted-foreground/30">404</p>
      <h1 className="text-2xl font-bold">Page introuvable</h1>
      <p className="text-muted-foreground">La page que vous cherchez n&apos;existe pas ou a été déplacée.</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>Retour à l&apos;accueil</Link>
    </div>
  );
}
