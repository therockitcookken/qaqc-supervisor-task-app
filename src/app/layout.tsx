import "./globals.css";
import { Nav } from "@/components/ui";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body className="bg-slate-50"><Nav /><main className="max-w-6xl mx-auto p-6">{children}</main></body></html>;
}
