import { getLang } from "@/lib/getLang";
import ResetPasswordForm from "./ResetPasswordForm";

export default async function ResetPasswordPage() {
  const lang = await getLang();
  return <ResetPasswordForm lang={lang} />;
}
