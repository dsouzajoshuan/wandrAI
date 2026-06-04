import "./globals.css";
import WandrAssistant from "@/components/WandrAssistant";

export const metadata = {
  title: "Wandr AI | Your World. One App.",
  description: "Plan trips. Discover hidden places. Book everything. Travel safer. The next evolution of luxury travel coordination.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0A0F1E] text-[#e2e2e2] overflow-x-hidden">
        {children}
        <WandrAssistant />
      </body>
    </html>
  );
}
