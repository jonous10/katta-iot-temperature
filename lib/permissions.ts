// This file contains all user permissions for your app
// Add or modify permissions here - it's the only place you need to change!

export enum UserType {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer',
  PENDING = 'pending'
}

// What each user type can do
export const PERMISSIONS = {
  // Temperature data permissions
  VIEW_TEMPERATURE: ['owner', 'admin', 'viewer'],
  VIEW_TEMPERATURE_HISTORY: ['owner', 'admin'],

  // Data management permissions
  EXPORT_DATA: ['owner', 'admin'],
  DELETE_DATA: ['owner'],

  // User management permissions
  VIEW_USERS: ['owner', 'admin'],
  MANAGE_USERS: ['owner', 'admin'],
  MANAGE_PERMISSIONS: ['owner'], // Only owner can access permissions page
  MANAGE_ADMINS: ['owner'], // Only owner can change admin/owner types

  // System permissions
  VIEW_SYSTEM_STATUS: ['owner', 'admin'],
  MANAGE_SYSTEM: ['owner']
};

// Helper class to check permissions
export class UserPermissions {
  // Check if a user type has a specific permission
  static hasPermission(userType: string, permission: string): boolean {
    const allowedTypes = PERMISSIONS[permission as keyof typeof PERMISSIONS];
    return allowedTypes ? allowedTypes.includes(userType) : false;
  }

  // Get all permissions for a user type
  static getAllPermissions(userType: string): string[] {
    const permissions: string[] = [];

    for (const [permission, allowedTypes] of Object.entries(PERMISSIONS)) {
      if (allowedTypes.includes(userType)) {
        permissions.push(permission);
      }
    }

    return permissions;
  }

  // Check if user can access a specific route
  static canAccessRoute(userType: string, route: string): boolean {
    // Define which user types can access which routes
    const routePermissions = {
      '/api': ['owner', 'admin', 'viewer'],
      '/api/export': ['owner', 'admin'],
      '/api/users': ['owner', 'admin'],
      '/api/delete': ['owner'],
      '/permissions': ['owner'], // Only owner can access permissions page
      '/users': ['owner', 'admin'] // Admins and owners can access users page
    };

    const allowedTypes = routePermissions[route as keyof typeof routePermissions];
    return allowedTypes ? allowedTypes.includes(userType) : false;
  }
}

// Example usage:
// const canView = UserPermissions.hasPermission('guest', 'VIEW_TEMPERATURE'); // returns true
// const canDelete = UserPermissions.hasPermission('guest', 'DELETE_DATA'); // returns false
