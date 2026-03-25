import { useState, useEffect } from 'react';

// Cache permissions in module scope so we only fetch once per session
let cachedPermissions: Record<string, string[]> | null = null;
let fetchPromise: Promise<Record<string, string[]>> | null = null;

async function loadPermissions(): Promise<Record<string, string[]>> {
  if (cachedPermissions) return cachedPermissions;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('/api/permissions/public')
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load permissions');
      return res.json();
    })
    .then((data) => {
      cachedPermissions = data.permissions;
      return cachedPermissions!;
    });

  return fetchPromise;
}

export function usePermissions() {
  const [userType, setUserType] = useState<string>('');
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get userType from cookie
    const getUserType = () => {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'userType') return value;
      }
      return '';
    };

    const type = getUserType();
    setUserType(type);

    // Load permissions from DB (cached after first load)
    loadPermissions()
      .then((perms) => {
        setPermissions(perms);
      })
      .catch((err) => {
        console.error('usePermissions: failed to load permissions', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!userType || !permissions[permission]) return false;
    return permissions[permission].includes(userType);
  };

  const isAdmin = (): boolean => userType === 'admin';
  const isViewer = (): boolean => userType === 'viewer';
  const isOwner = (): boolean => userType === 'owner';
  const isPending = (): boolean => userType === 'pending';

  const getAllPermissions = (): string[] => {
    if (!userType) return [];
    return Object.entries(permissions)
      .filter(([, roles]) => roles.includes(userType))
      .map(([key]) => key);
  };

  return {
    userType,
    loading,
    hasPermission,
    isAdmin,
    isViewer,
    isOwner,
    isPending,
    getAllPermissions,
  };
}