import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default function DownloadPage() {
  const resourcesUrl = process.env.RESOURCES_URL ?? "#";

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Télécharger les ressources</h1>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Ressources membres</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Accédez aux fichiers et ressources réservés aux membres.
          </p>
          <a href={resourcesUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants()}>
            Ouvrir Google Sheets
          </a>
        </CardContent>
      </Card>
    </main>
  );
}
