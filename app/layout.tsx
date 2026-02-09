import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Esther AI",
  description: "Esther AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
          <a
            href="/"
            style={buttonStyle}
            className=""
          >
            Home
          </a>
          <a
            href="/jobs"
            style={buttonStyle}
            className=""
          >
            Jobs
          </a>
          <a
            href="/admin/prompts"
            style={buttonStyle}
          >
            Prompts
          </a>
        </div>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        {children}
        </div>
      </body>
    </html>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "5px 0px",
  marginRight: "20px",
  borderRadius: 0,
  border: "0px solid #111",
  color: "#fff",
  fontWeight: 700,
  textDecoration: "underline",
  backgroundColor: "none"
};
