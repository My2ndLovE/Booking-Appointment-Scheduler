import { writable } from 'svelte/store';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { BookingWithRelations } from '$lib/types/booking';
import { supabase } from '$lib/supabase/client';

export const bookingsStore = writable<BookingWithRelations[]>([]);

let channel: RealtimeChannel | null = null;

export function subscribeToBookings(organizationId: string) {
	// Unsubscribe from previous channel
	if (channel) {
		supabase.removeChannel(channel);
	}

	// Create new channel
	channel = supabase
		.channel(`bookings:${organizationId}`)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'bookings',
				filter: `organization_id=eq.${organizationId}`
			},
			(payload) => {
				bookingsStore.update((bookings) => {
					if (payload.eventType === 'INSERT') {
						return [...bookings, payload.new as BookingWithRelations];
					} else if (payload.eventType === 'UPDATE') {
						return bookings.map((b) =>
							b.id === payload.new.id ? (payload.new as BookingWithRelations) : b
						);
					} else if (payload.eventType === 'DELETE') {
						return bookings.filter((b) => b.id !== payload.old.id);
					}
					return bookings;
				});
			}
		)
		.subscribe();

	return () => {
		if (channel) {
			supabase.removeChannel(channel);
		}
	};
}
