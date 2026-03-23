"use client";

import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="p-4 bg-(--sidebar-color) md:h-screen md:overflow-hidden">

      {/* MOBILE TOPBAR */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <h1 className="text-white text-xl font-bold">Sensordata</h1>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white focus:outline-none"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                mobileOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <nav className="flex flex-col space-y-1 bg-(--sidebar-color) p-3 rounded-xl">

          <MobileLink href="/" pathname={pathname} label="Dashboard" />

          {hasPermission("VIEW_TEMPERATURE_HISTORY") && (
            <MobileLink href="/data" pathname={pathname} label="Data" />
          )}

          <MobileLink href="/" pathname={pathname} label="History" />

          {hasPermission("VIEW_USERS") && (
            <MobileLink href="/users" pathname={pathname} label="Users" />
          )}

          <MobileLink href="/settings" pathname={pathname} label="Settings" />
        </nav>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex md:h-[calc(100vh-2rem)]">

        <aside className="w-56 bg-(--sidebar-color) flex flex-col py-6 relative flex-shrink-0">
          <div className="px-6 mb-8">
            <h1 className="text-white text-xl font-bold">Sensordata</h1>
          </div>

          <nav className="flex-1 flex flex-col px-2">
            <div className="space-y-1">
              <DesktopLink href="/" pathname={pathname} label="Dashboard" />

              {hasPermission("VIEW_TEMPERATURE_HISTORY") && (
                <DesktopLink href="/data" pathname={pathname} label="Data" />
              )}

              <DesktopLink href="/" pathname={pathname} label="History" />

              {hasPermission("VIEW_USERS") && (
                <DesktopLink href="/users" pathname={pathname} label="Users" />
              )}
            </div>

            <div className="mt-auto space-y-1">
              <DesktopLink
                href="/settings"
                pathname={pathname}
                label="Settings"
              />
            </div>
          </nav>
        </aside>

        <main className="flex-1 bg-white rounded-3xl ml-4 p-0 shadow-xl md:overflow-y-auto">

          {children}
        </main>
      </div>

      {/* MOBILE CONTENT AREA */}
      <div className="md:hidden bg-white rounded-3xl p-0 shadow-xl mt-4 overflow-y-auto max-h-screen">
        {children}
      </div>
    </div>
  );
}

/* --- COMPONENTS --- */

function MobileLink({
  href,
  pathname,
  label,
}: {
  href: string;
  pathname: string;
  label: string;
}) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`px-4 py-3 rounded-lg transition ${active
        ? "bg-white/10 text-white"
        : "text-white/70 hover:text-white hover:bg-white/5"
        }`}
    >
      {label}
    </Link>
  );
}

function DesktopLink({
  href,
  pathname,
  label,
}: {
  href: string;
  pathname: string;
  label: string;
}) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 ${active
        ? "text-white bg-white/10"
        : "text-white/70 hover:text-white hover:bg-white/5"
        }`}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-10 bg-white rounded-r-full" />
      )}
      <span className="font-medium">{label}</span>
    </Link>
  );
}
