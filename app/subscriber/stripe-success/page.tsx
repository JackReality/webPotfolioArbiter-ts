import { getByCode } from "@/services/TrainingService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ code?: string }>;
}

export default async function StripeSuccessPage({ searchParams }: Props) {
  const { code } = await searchParams;
  const training = code ? await getByCode(code) : null;

  return (
    <main className="container mx-auto py-10 flex justify-center">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Paiement confirmé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {training ? (
            <>
              <p className="text-muted-foreground">
                Vous avez maintenant accès à la formation
              </p>
              <p className="text-xl font-semibold">{training.title}</p>
              <Link href={training.pageUrl ?? "#"} className={buttonVariants({ className: "w-full" })}>
                Accéder à la formation
              </Link>
            </>
          ) : (
            <p className="text-muted-foreground">
              Votre achat a bien été enregistré.
            </p>
          )}
          <Link href="/subscriber/myspace" className={buttonVariants({ variant: "outline", className: "w-full" })}>
            Mon espace
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
