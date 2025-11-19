import type { Database } from './database';

export type Service = Database['public']['Tables']['services']['Row'];
export type ServiceInsert = Database['public']['Tables']['services']['Insert'];
export type ServiceUpdate = Database['public']['Tables']['services']['Update'];

export interface ServiceWithStaff extends Service {
	staff_services?: {
		staff: {
			id: string;
			user: {
				full_name: string;
				avatar_url: string | null;
			};
		};
	}[];
}
