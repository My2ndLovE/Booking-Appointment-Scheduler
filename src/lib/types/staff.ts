import type { Database } from './database';

export type StaffMember = Database['public']['Tables']['staff_members']['Row'];
export type StaffMemberInsert = Database['public']['Tables']['staff_members']['Insert'];
export type StaffMemberUpdate = Database['public']['Tables']['staff_members']['Update'];

export interface WorkingHours {
	monday: TimeSlot[];
	tuesday: TimeSlot[];
	wednesday: TimeSlot[];
	thursday: TimeSlot[];
	friday: TimeSlot[];
	saturday: TimeSlot[];
	sunday: TimeSlot[];
	exceptions?: {
		[date: string]: {
			available: boolean;
			hours?: TimeSlot[];
			reason?: string;
		};
	};
}

export interface TimeSlot {
	start: string; // HH:mm format
	end: string; // HH:mm format
}

export interface StaffMemberWithUser extends StaffMember {
	user: {
		id: string;
		full_name: string;
		email: string;
		avatar_url: string | null;
	};
}

export interface StaffMemberWithServices extends StaffMemberWithUser {
	staff_services?: {
		service: {
			id: string;
			name: string;
			color: string;
		};
	}[];
}
