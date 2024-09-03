import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ weight: ["400", "600"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Muse.ai",
  description:
    "I am the Spotcheck Bot. Ask me anything regarding procurement, purchase, and logistics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* You can remove the link to Poppins if using the import above */}
      </head>
      <body className={`${inter.className} ${poppins.className}`}>
        {children}
      </body>
    </html>
  );
}