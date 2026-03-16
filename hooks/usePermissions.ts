import { useState, useEffect } from 'react';
import { UserPermissions } from '../lib/permissions';

// This hook helps you check user permissions in your React components
export function usePermissions() {
  const [userType, setUserType] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user type from cookies on client side
    const getUserType = () => {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'userType') {
          return value;
        }
      }
      return '';
    };

    const type = getUserType();
    setUserType(type);
    setLoading(false);
  }, []); // Empty dependency array means this runs only once on mount

  // Check if current user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!userType) return false;
    return UserPermissions.hasPermission(userType, permission);
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return userType === 'admin';
  };

  // Check if user is guest
  const isGuest = (): boolean => {
    return userType === 'guest';
  };

  // Get all permissions for current user
  const getAllPermissions = (): string[] => {
    if (!userType) return [];
    return UserPermissions.getAllPermissions(userType);
  };

  return {
    userType,
    loading,
    hasPermission,
    isAdmin,
    isGuest,
    getAllPermissions
  };
}

// Example usage in your components:
//
// import { usePermissions } from '../hooks/usePermissions';
//
// function MyComponent() {
//   const { hasPermission, isAdmin, loading } = usePermissions();
//
//   if (loading) return <div>Loading...</div>;
//
//   return (
//     <div>
//       {hasPermission('VIEW_TEMPERATURE') && (
//         <div>Temperature data here</div>
//       )}
//
//       {isAdmin() && (
//         <button>Delete Data</button>
//       )}
//     </div>
//   );
// }
