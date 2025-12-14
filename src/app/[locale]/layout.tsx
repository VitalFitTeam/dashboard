import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing"; 
import React from "react";

type Props = {
  children: React.ReactNode;
  params: {
    locale: string;
  };
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: Props) {
  const resolvedParams = await Promise.resolve(props.params);
  const locale = resolvedParams.locale;

  return (
    <NextIntlClientProvider locale={locale} messages={{}}>
      {props.children}
    </NextIntlClientProvider>
  );
}
