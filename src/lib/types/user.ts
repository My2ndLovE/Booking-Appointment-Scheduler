import type { Database } from './database';

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type UserRole = 'owner' | 'staff' | 'customer';

export interface UserPreferences {
	timezone: string;
	email_notifications: boolean;
	sms_notifications: boolean;
	language?: string;
}

export interface UserWithOrganization extends User {
	organization?: {
		id: string;
		name: string;
		slug: string;
	};
}
