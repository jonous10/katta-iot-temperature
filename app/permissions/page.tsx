"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import Header from "../components/Header";

const ALL_PERMISSIONS = [
  { key: "VIEW_TEMPERATURE", label: "View Temperature", category: "Temperature" },
  { key: "VIEW_TEMPERATURE_HISTORY", label: "View History", category: "Temperature" },
  { key: "EXPORT_DATA", label: "Export Data", category: "Data" },
  { key: "DELETE_DATA", label: "Delete Data", category: "Data" },
  { key: "VIEW_USERS", label: "View Users", category: "Users" },
  { key: "MANAGE_USERS", label: "Manage Users", category: "Users" },
  { key: "MANAGE_PERMISSIONS", label: "Manage Permissions", category: "Users" },
  { key: "MANAGE_ADMINS", label: "Manage Admins", category: "Users" },
  { key: "VIEW_SYSTEM_STATUS", label: "View System Status", category: "System" },
  { key: "MANAGE_SYSTEM", label: "Manage System", category: "System" },
];

const ROLES = ["owner", "admin", "viewer", "pending"];

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-purple-100 text-purple-700 border-purple-200",
  admin: "bg-blue-100 text-blue-700 border-blue-200",
  viewer: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
};

// Permissions that can never be removed from owner (safety locks)
const OWNER_LOCKED: string[] = ["MANAGE_PERMISSIONS", "MANAGE_ADMINS", "MANAGE_SYSTEM", "DELETE_DATA"];

type PermissionMap = Record<string, string[]>; // { PERMISSION_KEY: ["owner","admin",...] }

export default function PermissionsPage() {
  const router = useRouter();
  const { isOwner, loading } = usePermissions();

  const [permissions, setPermissions] = useState<PermissionMap>({});
  const [original, setOriginal] = useState<PermissionMap>({});
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!isOwner()) {
        router.push("/");
        return;
      }
      fetchPermissions();
    }
  }, [loading]);

  const fetchPermissions = async () => {
    try {
      const res = await fetch("/api/permissions");
      if (!res.ok) throw new Error("Failed to load permissions");
      const data = await res.json();
      setPermissions(data.permissions);
      setOriginal(data.permissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading permissions");
    } finally {
      setFetching(false);
    }
  };

  const toggle = (permKey: string, role: string) => {
    // Owner can never lose locked permissions
    if (role === "owner" && OWNER_LOCKED.includes(permKey)) return;

    setPermissions((prev) => {
      const current = prev[permKey] ?? [];
      const updated = current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role];
      return { ...prev, [permKey]: updated };
    });
    setSaved(false);
  };

  const hasChanges = JSON.stringify(permissions) !== JSON.stringify(original);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Save failed");
      }
      setOriginal(permissions);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setPermissions(original);
    setSaved(false);
  };

  const categories = [...new Set(ALL_PERMISSIONS.map((p) => p.category))];

  if (loading || fetching) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading permissions...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Permissions</h2>
            <p className="text-gray-500 mt-1 text-sm">
              Control what each role can do. Changes take effect immediately after saving.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                onClick={reset}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Discard
              </button>
            )}
            <button
              onClick={save}
              disabled={!hasChanges || saving}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm
                ${hasChanges && !saving
                  ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white hover:shadow-md hover:scale-[1.02]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
            >
              {saving ? "Saving…" : saved ? "✓ Saved" : "Save Changes"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <span
              key={role}
              className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${ROLE_COLORS[role]}`}
            >
              {role}
            </span>
          ))}
        </div>

        {/* Permission table per category */}
        <div className="space-y-6">
          {categories.map((category) => {
            const catPerms = ALL_PERMISSIONS.filter((p) => p.category === category);
            return (
              <div key={category} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Category header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    {category}
                  </h3>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-100">
                  {catPerms.map((perm) => {
                    const enabledRoles = permissions[perm.key] ?? [];
                    return (
                      <div
                        key={perm.key}
                        className="px-6 py-4 flex items-center gap-4 flex-wrap hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Permission name */}
                        <div className="flex-1 min-w-[180px]">
                          <p className="text-sm font-medium text-gray-800">{perm.label}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{perm.key}</p>
                        </div>

                        {/* Role toggles */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {ROLES.map((role) => {
                            const isOn = enabledRoles.includes(role);
                            const locked = role === "owner" && OWNER_LOCKED.includes(perm.key);
                            return (
                              <button
                                key={role}
                                onClick={() => toggle(perm.key, role)}
                                disabled={locked}
                                title={locked ? "Owner always has this permission" : undefined}
                                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 capitalize
                                  ${isOn
                                    ? `${ROLE_COLORS[role]} shadow-sm`
                                    : "bg-white text-gray-300 border-gray-200 hover:border-gray-300"
                                  }
                                  ${locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"}
                                `}
                              >
                                {role}
                                {locked && (
                                  <span className="ml-1 text-[10px]">🔒</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Unsaved changes banner */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl text-sm z-50">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            You have unsaved changes
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-1.5 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              {saving ? "Saving…" : "Save now"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}