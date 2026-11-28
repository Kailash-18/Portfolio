import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import ScrollMotion from "../components/navigation/ScrollMotion";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kailash Ambadipudi",
  description: "Explore Kailash Ambadipudi’s interactive signal studio, multi-cloud infrastructure projects and DevOps case studies.",
};
export const viewport: Viewport = {
  themeColor: "#090d0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Browser extensions can attach their own attributes to the root before hydration.
  return <html lang="en" suppressHydrationWarning><body><ScrollMotion />{children}</body></html>;
}
