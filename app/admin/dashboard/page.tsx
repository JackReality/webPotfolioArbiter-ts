import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Users, BookOpen, Mail } from "lucide-react";

const sections = [
  {
    title: "Utilisateurs",
    description: "Gérer les comptes, rôles et suppressions",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Formations",
    description: "Ajouter, modifier ou supprimer des formations",
    href: "/admin/trainings",
    icon: BookOpen,
  },
  {
    title: "Templates emails",
    description: "Éditer les emails transactionnels (FR/EN/ES)",
    href: "/admin/email-templates",
    icon: Mail,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {sections.map((s) => (
        <Card key={s.href} className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center gap-4">
            <s.icon className="h-8 w-8 text-primary" />
            <CardTitle>{s.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">{s.description}</p>
            <Link href={s.href} className={buttonVariants({ variant: "default" })}>
              Accéder
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
