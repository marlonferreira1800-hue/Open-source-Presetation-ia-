import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrigamiDeck AI • Presentations.ai Clone",
  description: "Gerador de apresentações adaptativas com IA acelerado por NVIDIA NIM e Origami Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased select-none">{children}</body>
    </html>
  );
}
