import { ReactNode } from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { Topbar } from "@/components/navigation/topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Topbar />
        <main className="px-10 py-12 space-y-12">{children}</main>
      </div>
    </div>
  );
}
