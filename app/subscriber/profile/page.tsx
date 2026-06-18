import { getSession } from "@/lib/auth";
import ProfileForms from "./ProfileForms";

export default async function ProfilePage() {
  const session = await getSession();

  return (
    <main className="container mx-auto py-10 max-w-lg">
      <h1 className="text-2xl font-bold mb-8">Mon profil</h1>
      <ProfileForms
        displayName={session.displayName}
        email={session.email}
        language={session.language}
        role={session.role}
        lang={session.language}
      />
    </main>
  );
}
