import { getSession } from "@/lib/auth";
import { getByCodes } from "@/services/TrainingService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default async function MyspacePage() {
  const session = await getSession();
  const trainings = await getByCodes(session.trainings ?? []);

  return (
    <main className="container mx-auto py-10 space-y-8">
      <h1 className="text-2xl font-bold">Mon espace</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ressources</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/subscriber/download" className={buttonVariants()}>
            Télécharger les ressources
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mes formations</CardTitle>
        </CardHeader>
        <CardContent>
          {trainings.length === 0 ? (
            <div className="space-y-3">
              <p className="text-muted-foreground">Aucune formation achetée.</p>
              <Link href="/catalog" className={buttonVariants({ variant: "outline" })}>
                Voir les formations
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {trainings.map((t) => (
                <li key={t.id} className="flex items-center justify-between">
                  <span className="font-medium">{t.title}</span>
                  <Link href={t.pageUrl ?? "/catalog"} className={buttonVariants()}>
                    Accéder
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
