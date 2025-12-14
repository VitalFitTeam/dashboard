// src/app/[locale]/(auth)/layout.tsx

import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

const MESSAGE_PATH = "../../../../messages";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;

  let messages;
  try {
    const authMessages = (await import(`${MESSAGE_PATH}/${locale}/auth.json`))
      .default;
    messages = { Auth: authMessages.Auth };
  } catch (error) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
