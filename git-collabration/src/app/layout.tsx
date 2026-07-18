import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import { DialogProvider } from "@/components/dialog-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GitHub Collaborator Access Manager",
  description: "Visibility and employee mapping for GitHub collaborator access."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DialogProvider>{children}</DialogProvider>
      </body>
    </html>
  );
}
