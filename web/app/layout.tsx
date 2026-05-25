import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verifacta — verified data for journalists",
  description:
    "Layer-2 verification agent powered by the World Bank Data360 MCP.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
