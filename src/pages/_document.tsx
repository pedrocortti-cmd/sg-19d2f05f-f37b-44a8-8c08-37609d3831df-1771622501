import { Html, Head, Main, NextScript } from "next/document";
import { SEOElements } from "@/components/SEO";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <SEOElements />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}