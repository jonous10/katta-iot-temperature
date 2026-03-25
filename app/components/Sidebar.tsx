"use client";

import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  children: React.ReactNode;
}

const Icons = {
  Dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Data: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  History: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" strokeLinecap="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.85" strokeLinecap="round" />
    </svg>
  ),
  Permissions: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  Settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

export default function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="p-4 bg-(--sidebar-color) md:h-screen md:overflow-hidden">

      {/* MOBILE TOPBAR */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <h1 className="text-white text-xl font-bold">Sensordata</h1>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white focus:outline-none">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* MOBILE MENU */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <nav className="flex flex-col space-y-1 bg-(--sidebar-color) p-3 rounded-xl">
          <MobileLink href="/" pathname={pathname} label="Dashboard" icon={Icons.Dashboard} />
          {hasPermission("VIEW_TEMPERATURE_HISTORY") && (
            <MobileLink href="/data" pathname={pathname} label="Data" icon={Icons.Data} />
          )}
          <MobileLink href="/history" pathname={pathname} label="History" icon={Icons.History} />
          {hasPermission("VIEW_USERS") && (
            <MobileLink href="/users" pathname={pathname} label="Users" icon={Icons.Users} />
          )}
          {hasPermission("MANAGE_PERMISSIONS") && (
            <MobileLink href="/permissions" pathname={pathname} label="Permissions" icon={Icons.Permissions} />
          )}
          <MobileLink href="/settings" pathname={pathname} label="Settings" icon={Icons.Settings} />
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
              <DesktopLink href="/" pathname={pathname} label="Dashboard" icon={Icons.Dashboard} />
              {hasPermission("VIEW_TEMPERATURE_HISTORY") && (
                <DesktopLink href="/data" pathname={pathname} label="Data" icon={Icons.Data} />
              )}
              <DesktopLink href="/history" pathname={pathname} label="History" icon={Icons.History} />
              {hasPermission("VIEW_USERS") && (
                <DesktopLink href="/users" pathname={pathname} label="Users" icon={Icons.Users} />
              )}
              {hasPermission("MANAGE_PERMISSIONS") && (
                <DesktopLink href="/permissions" pathname={pathname} label="Permissions" icon={Icons.Permissions} />
              )}
            </div>

            <div className="mt-auto space-y-1">
              <DesktopLink href="/settings" pathname={pathname} label="Settings" icon={Icons.Settings} />
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

/* --- LINK COMPONENTS --- */

function MobileLink({ href, pathname, label, icon }: {
  href: string; pathname: string; label: string; icon: React.ReactNode;
}) {
  const active = pathname === href;
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${active ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5"}`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function DesktopLink({ href, pathname, label, icon }: {
  href: string; pathname: string; label: string; icon: React.ReactNode;
}) {
  const active = pathname === href;
  return (
    <Link href={href} className={`relative flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 ${active ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5"}`}>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-10 bg-white rounded-r-full" />
      )}
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}