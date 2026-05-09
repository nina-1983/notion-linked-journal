import "./globals.css";

export const metadata = {
  title: "Nina’s Journal",
  description: "A calm Notion-linked reflection system.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
