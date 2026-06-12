import { getLang } from "@/lib/getLang";
import ContactForm from "@/components/ContactForm";

export default async function ContactPage() {
  const lang = await getLang();
  return <ContactForm lang={lang} />;
}
