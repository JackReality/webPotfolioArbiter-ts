import { getLang } from "@/lib/getLang";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default async function ForgotPasswordPage() {
  const lang = await getLang();
  return <ForgotPasswordForm lang={lang} />;
}
