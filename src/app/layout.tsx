import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";

export const metadata: Metadata = {
  title: "Devil Gaming | Elite Hardware & Gaming Setup",
  description: "Dominá tu mundo con el estándar de élite en hardware. PCs armadas, componentes premium y periféricos de alto rendimiento.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
