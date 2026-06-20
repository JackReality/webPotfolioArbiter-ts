import { getSession } from "@/lib/auth";
import NewSubjectForm from "@/components/forum/NewSubjectForm";

export default async function NewSubjectPage() {
  const session = await getSession();
  const lang = session.language ?? "fr";
  const role = session.role ?? "subscriber";

  return <NewSubjectForm lang={lang} role={role} />;
}
