import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import Header from "./header";
import { Toaster } from "@/components/ui/toaster";
import Footer from "./footer";
import { ThemeProvider } from "@/components/ui/theme-provider";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FileScribe",
  description: "Your digital heaven for seamless file organization and storage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
          <Toaster />
          <Header />
          {children}
          <Footer />
          </ThemeProvider>
        </ConvexClientProvider>
        </body>
    </html>
  );
}
