import type { Metadata } from "next";
import "./globals.css";
import AuthInitializer from "./AuthInitializer";
import { LoaderProvider } from "./LoaderProvider";

export const metadata: Metadata = {
  title: "Swapees Kitchen | Home Cooked Happiness",
  description: "Order fresh, authentic home-cooked meals straight to your door.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LoaderProvider>
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </LoaderProvider>
      </body>
    </html>
  );
}
