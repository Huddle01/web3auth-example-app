import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HuddleContextProvider from "@/utils/HuddleContextProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Custom Auth",
  description: "Huddle01 app with web3auth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HuddleContextProvider>{children} </HuddleContextProvider>
      </body>
    </html>
  );
}
