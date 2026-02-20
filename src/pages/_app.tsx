import "@/styles/globals.css";
import "@/styles/pos.css";
import "@/styles/reports.css";
import "@/styles/inventory.css";
import "@/styles/drivers.css";
import "@/styles/logo-settings.css";
import "@/styles/preview-modal.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}