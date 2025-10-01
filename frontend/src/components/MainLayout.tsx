
import Footer from "./Footer";
import type { ReactNode } from "react";


export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
