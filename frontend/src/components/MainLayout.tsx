import Footer from "./Footer";
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex flex-col flex-1 min-h-screen">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}
