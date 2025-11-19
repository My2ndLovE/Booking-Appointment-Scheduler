import { writable } from 'svelte/store';
import type { Session, User } from '@supabase/supabase-js';
import type { User as AppUser } from '$lib/types/user';

interface AuthState {
	session: Session | null;
	user: User | null;
	profile: AppUser | null;
	loading: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		session: null,
		user: null,
		profile: null,
		loading: true
	});

	return {
		subscribe,
		setSession: (session: Session | null) => {
			update((state) => ({
				...state,
				session,
				user: session?.user || null,
				loading: false
			}));
		},
		setProfile: (profile: AppUser | null) => {
			update((state) => ({
				...state,
				profile
			}));
		},
		setLoading: (loading: boolean) => {
			update((state) => ({
				...state,
				loading
			}));
		},
		reset: () => {
			set({
				session: null,
				user: null,
				profile: null,
				loading: false
			});
		}
	};
}

export const authStore = createAuthStore();
