export const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
}

export const hasRole = (user, requiredRole) => {
  return user?.role === requiredRole
}

export const isAdmin = (user) => hasRole(user, ROLES.ADMIN)
export const isEmployee = (user) => hasRole(user, ROLES.EMPLOYEE)