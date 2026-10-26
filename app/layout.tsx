import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "./service-worker-register";
export const metadata: Metadata = { title: "Forma | Team Library", description: "A thoughtful working library for independent creative teams.", applicationName: "Forma", manifest: "/manifest.webmanifest", themeColor: "#f4f1f8" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><ServiceWorkerRegister/>{children}</body></html>; }