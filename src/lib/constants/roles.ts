export const USER_ROLES = {
	OWNER: 'owner',
	STAFF: 'staff',
	CUSTOMER: 'customer'
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
