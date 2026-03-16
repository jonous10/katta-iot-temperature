// This file contains all user permissions for your app
// Add or modify permissions here - it's the only place you need to change!

export enum UserType {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  GUEST = 'guest'
}

// What each user type can do
export const PERMISSIONS = {
  // Temperature data permissions
  VIEW_TEMPERATURE: ['admin', 'manager', 'operator', 'guest'],
  VIEW_TEMPERATURE_HISTORY: ['admin', 'manager', 'operator'],
  VIEW_DETAILED_ANALYTICS: ['admin', 'manager'],
  
  // Data management permissions
  EXPORT_DATA: ['admin', 'manager'],
  DELETE_DATA: ['admin'],
  
  // User management permissions
  VIEW_USERS: ['admin'],
  MANAGE_USERS: ['admin'],
  
  // System permissions
  VIEW_SYSTEM_STATUS: ['admin', 'manager'],
  MANAGE_SYSTEM: ['admin']
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
      '/api': ['admin', 'manager', 'operator', 'guest'],
      '/api/export': ['admin', 'manager'],
      '/api/users': ['admin'],
      '/api/delete': ['admin']
    };
    
    const allowedTypes = routePermissions[route as keyof typeof routePermissions];
    return allowedTypes ? allowedTypes.includes(userType) : false;
  }
}

// Example usage:
// const canView = UserPermissions.hasPermission('guest', 'VIEW_TEMPERATURE'); // returns true
// const canDelete = UserPermissions.hasPermission('guest', 'DELETE_DATA'); // returns false
