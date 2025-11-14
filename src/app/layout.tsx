import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Garden Style Discovery",
  description:
    "An agentic questionnaire that guides clients toward their ideal garden aesthetic, planting palette, and outdoor experience."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
