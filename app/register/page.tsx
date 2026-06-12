import { getLang } from "@/lib/getLang";
import RegisterForm from "@/components/RegisterForm";

export default async function RegisterPage() {
  const lang = await getLang();
  return <RegisterForm lang={lang} />;
}
