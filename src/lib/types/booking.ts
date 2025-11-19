import type { Database } from './database';

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface BookingWithRelations extends Booking {
	service?: {
		name: string;
		duration_minutes: number;
		color: string;
	};
	staff?: {
		user: {
			full_name: string;
			avatar_url: string | null;
		};
	};
	organization?: {
		name: string;
		email: string;
		slug: string;
	};
}
