import type { Database } from './database';

export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];

export interface BusinessHours {
	monday: DayHours;
	tuesday: DayHours;
	wednesday: DayHours;
	thursday: DayHours;
	friday: DayHours;
	saturday: DayHours;
	sunday: DayHours;
}

export interface DayHours {
	enabled: boolean;
	open?: string; // HH:mm format
	close?: string; // HH:mm format
}

export interface OrganizationSettings {
	booking_buffer_minutes: number;
	max_advance_booking_days: number;
	min_advance_booking_hours: number;
	cancellation_hours: number;
	timezone: string;
	currency?: string;
	payment_required?: boolean;
}
