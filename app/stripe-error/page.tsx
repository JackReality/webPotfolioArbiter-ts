import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function StripeErrorPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-3xl font-bold">Paiement non confirmé</h1>
      <p className="text-muted-foreground">Le paiement n&apos;a pas pu être validé. Aucun montant n&apos;a été débité.</p>
      <div className="flex gap-3">
        <Link href="/catalog" className={buttonVariants({ variant: "outline" })}>Retour au catalogue</Link>
        <Link href="/contact" className={buttonVariants()}>Nous contacter</Link>
      </div>
    </div>
  );
}
