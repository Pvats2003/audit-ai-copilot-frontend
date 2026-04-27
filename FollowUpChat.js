import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm",
});

export const metadata = {
  title: "Audit AI Copilot — Internal Audit Intelligence",
  description: "AI-powered business process risk assessment and control gap analysis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${ibmPlexMono.variable} font-mono antialiased`}>
        {children}
      </body>
    </html>
  );
}
