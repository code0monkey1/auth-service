export const ROLES = {
    CUSTOMER: "customer",
    ADMIN: "admin",
    MANAGER: "manager",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];
