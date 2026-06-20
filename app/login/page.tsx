import { getLang } from "@/lib/getLang";
import { t } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; returnUrl?: string; registered?: string }>;
}) {
  const lang = await getLang();
  const params = await searchParams;
  const hasError = params.error === "1";
  const registered = params.registered === "1";
  const returnUrl = params.returnUrl ?? "/subscriber/myspace";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("auth.signIn", lang)}</CardTitle>
          <CardDescription>{t("auth.loginSubtitle", lang)}</CardDescription>
        </CardHeader>
        <CardContent>
          {registered && (
            <Alert className="mb-4">
              <AlertDescription>{t("auth.signupSuccess", lang)}</AlertDescription>
            </Alert>
          )}
          {hasError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{t("ERR_SYSTEM", lang)}</AlertDescription>
            </Alert>
          )}
          <form action="/api/auth/login" method="POST" className="space-y-4">
            <input type="hidden" name="returnUrl" value={returnUrl} />
            <div className="space-y-1">
              <Label htmlFor="email">{t("auth.email", lang)}</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">{t("auth.password", lang)}</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full">{t("auth.signIn", lang)}</Button>
          </form>
          <div className="mt-4 space-y-2 text-sm text-center text-muted-foreground">
            <p>
              <Link href="/forgot-password" className="hover:text-foreground transition-colors">
                {t("auth.forgotPassword", lang)}
              </Link>
            </p>
            <p>
              {t("auth.noAccount", lang)}{" "}
              <Link href="/register" className="text-foreground hover:underline">
                {t("auth.createAccount", lang)}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
