// See https://kit.svelte.dev/docs/types#app
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { UserWithOrganization } from '$lib/types/user';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			getSession(): Promise<Session | null>;
		}
		interface PageData {
			session: Session | null;
			profile?: UserWithOrganization | null;
		}
		// interface Error {}
		// interface Platform {}
	}
}

export {};
