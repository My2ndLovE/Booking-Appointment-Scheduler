// Database types generated from Supabase schema
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			organizations: {
				Row: {
					id: string;
					slug: string;
					name: string;
					description: string | null;
					email: string;
					phone: string | null;
					logo_url: string | null;
					timezone: string;
					business_hours: Json;
					settings: Json;
					stripe_account_id: string | null;
					is_active: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					slug: string;
					name: string;
					description?: string | null;
					email: string;
					phone?: string | null;
					logo_url?: string | null;
					timezone?: string;
					business_hours?: Json;
					settings?: Json;
					stripe_account_id?: string | null;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					slug?: string;
					name?: string;
					description?: string | null;
					email?: string;
					phone?: string | null;
					logo_url?: string | null;
					timezone?: string;
					business_hours?: Json;
					settings?: Json;
					stripe_account_id?: string | null;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			users: {
				Row: {
					id: string;
					email: string;
					full_name: string;
					phone: string | null;
					avatar_url: string | null;
					role: string;
					organization_id: string | null;
					is_active: boolean;
					preferences: Json;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					email: string;
					full_name: string;
					phone?: string | null;
					avatar_url?: string | null;
					role?: string;
					organization_id?: string | null;
					is_active?: boolean;
					preferences?: Json;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					email?: string;
					full_name?: string;
					phone?: string | null;
					avatar_url?: string | null;
					role?: string;
					organization_id?: string | null;
					is_active?: boolean;
					preferences?: Json;
					created_at?: string;
					updated_at?: string;
				};
			};
			services: {
				Row: {
					id: string;
					organization_id: string;
					name: string;
					description: string | null;
					duration_minutes: number;
					price: number;
					currency: string;
					color: string;
					icon: string | null;
					buffer_time_minutes: number;
					max_advance_booking_days: number | null;
					is_active: boolean;
					display_order: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					organization_id: string;
					name: string;
					description?: string | null;
					duration_minutes: number;
					price: number;
					currency?: string;
					color?: string;
					icon?: string | null;
					buffer_time_minutes?: number;
					max_advance_booking_days?: number | null;
					is_active?: boolean;
					display_order?: number;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					organization_id?: string;
					name?: string;
					description?: string | null;
					duration_minutes?: number;
					price?: number;
					currency?: string;
					color?: string;
					icon?: string | null;
					buffer_time_minutes?: number;
					max_advance_booking_days?: number | null;
					is_active?: boolean;
					display_order?: number;
					created_at?: string;
					updated_at?: string;
				};
			};
			staff_members: {
				Row: {
					id: string;
					user_id: string;
					organization_id: string;
					title: string | null;
					bio: string | null;
					working_hours: Json;
					is_active: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					organization_id: string;
					title?: string | null;
					bio?: string | null;
					working_hours?: Json;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					organization_id?: string;
					title?: string | null;
					bio?: string | null;
					working_hours?: Json;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			staff_services: {
				Row: {
					id: string;
					staff_id: string;
					service_id: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					staff_id: string;
					service_id: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					staff_id?: string;
					service_id?: string;
					created_at?: string;
				};
			};
			bookings: {
				Row: {
					id: string;
					organization_id: string;
					service_id: string;
					staff_id: string;
					customer_id: string;
					booking_date: string;
					start_time: string;
					end_time: string;
					timezone: string;
					status: string;
					price: number;
					payment_status: string;
					payment_intent_id: string | null;
					customer_name: string;
					customer_email: string;
					customer_phone: string | null;
					notes: string | null;
					cancellation_reason: string | null;
					cancelled_at: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					organization_id: string;
					service_id: string;
					staff_id: string;
					customer_id: string;
					booking_date: string;
					start_time: string;
					end_time: string;
					timezone: string;
					status?: string;
					price: number;
					payment_status?: string;
					payment_intent_id?: string | null;
					customer_name: string;
					customer_email: string;
					customer_phone?: string | null;
					notes?: string | null;
					cancellation_reason?: string | null;
					cancelled_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					organization_id?: string;
					service_id?: string;
					staff_id?: string;
					customer_id?: string;
					booking_date?: string;
					start_time?: string;
					end_time?: string;
					timezone?: string;
					status?: string;
					price?: number;
					payment_status?: string;
					payment_intent_id?: string | null;
					customer_name?: string;
					customer_email?: string;
					customer_phone?: string | null;
					notes?: string | null;
					cancellation_reason?: string | null;
					cancelled_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
	};
}
