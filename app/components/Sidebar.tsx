"use client";

import { usePermissions } from "@/hooks/usePermissions";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();

  const { hasPermission, userType, loading, isAdmin } = usePermissions();
  return (
    <div className="h-screen bg-[#7B79B8] p-4 overflow-hidden">
      <div className="flex h-[calc(100vh-2rem)]">
        {/* Sidebar - fixed height */}
        <aside className="w-56 bg-[#7B79B8] flex flex-col py-6 relative flex-shrink-0">
          {/* Logo/Title */}
          <div className="px-6 mb-8">
            <h1 className="text-white text-xl font-bold">Sensordata</h1>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 flex flex-col px-2">
            <div className="space-y-1">
              {/* Dashboard */}
              <Link
                href="/"
                className={`relative flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 ${pathname === "/"
                  ? "text-white bg-white/10"
                  : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
              >
                {/* Active indicator - white bar on the left */}
                {pathname === "/" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-10 bg-white rounded-r-full" />
                )}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="font-medium">Dashboard</span>
              </Link>

              {/* Data */}
              <Link
                href="/"
                className={`relative flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 ${pathname === "/"
                  ? "text-white bg-white/10"
                  : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
              >
                {pathname === "/" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-10 bg-white rounded-r-full" />
                )}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">Data</span>
              </Link>

              {/* History */}
              <Link
                href="/"
                className={`relative flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 ${pathname === "/"
                  ? "text-white bg-white/10"
                  : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
              >
                {pathname === "/" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-10 bg-white rounded-r-full" />
                )}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">History</span>
              </Link>

              {/* Users */}
              {hasPermission('VIEW_USERS') && (
                <Link
                  href="/users"
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 ${pathname === "/users"
                    ? "text-white bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {pathname === "/users" && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-10 bg-white rounded-r-full" />
                  )}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <span className="font-medium">Users</span>
                </Link>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="mt-auto space-y-1">
              {/* Settings */}
              <Link
                href="/settings"
                className={`relative flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 ${pathname === "/settings"
                  ? "text-white bg-white/10"
                  : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
              >
                {pathname === "/settings" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-10 bg-white rounded-r-full" />
                )}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">Settings</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content Area - scrollable */}
        <main className="flex-1 bg-white rounded-3xl ml-4 p-8 shadow-xl overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
