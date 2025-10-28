import "@mantine/core/styles.css";

import { Header } from "@/components/Header";
import { AuthProvider } from "@/constants/AuthContext";
import { theme } from "@/constants/theme";
import { ColorSchemeScript, MantineProvider, Stack } from "@mantine/core";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ScopeBuilder",
  description: "AI powered scope of work document builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <AuthProvider>
            <Stack h="100vh">
              <Header />
              {children}
            </Stack>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
