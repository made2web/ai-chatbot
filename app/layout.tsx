import { Metadata } from "next";
import { Toaster } from "sonner";

import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { KasadaClient } from "@/utils/kasada/kasada-client";

export const metadata: Metadata = {
  metadataBase: new URL("https://chat.vercel.ai"),
  title: "Assistente RH - Made2Web",
  description: "Assistente RH - Made2Web",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <KasadaClient />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          {/* <Navbar /> */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
