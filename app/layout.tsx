import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ServiceWorkerRegister } from "./service-worker-register";
export const viewport: Viewport = { themeColor: "#f4f1f8", width: "device-width", initialScale: 1 };
export const metadata: Metadata = { title: "Forma | Team Library", description: "A thoughtful working library for independent creative teams.", applicationName: "Forma", manifest: "/manifest.webmanifest" };
export default function RootLayout({children}:{children:ReactNode}) { return <html lang="en"><body><ServiceWorkerRegister/>{children}</body></html>; }
