import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

const MESSAGE_PATH = "../../../../messages";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // 👈 ESTO ES CLAVE

  let messages;

  try {
    const authMessages = (
      await import(`${MESSAGE_PATH}/${locale}/auth.json`)
    ).default;

    messages = {
      Auth: authMessages.Auth,
    };
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

