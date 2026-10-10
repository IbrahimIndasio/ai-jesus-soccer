import { headers } from "next/headers";
import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: "AI Jesus | Soccer Prophet",
  description:
    "Football analysis grounded in data. A little wisdom. A little humility.",
  manifest: "/manifest.json",
  openGraph: { images: ["/og-image.png"] },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = headers().get("x-nonce") || undefined;
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `try { document.documentElement.classList.toggle("dark",localStorage.getItem("aij_theme")!=="light"); } catch {}`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${cormorant.variable}`}>
        {children}
      </body>
    </html>
  );
}
