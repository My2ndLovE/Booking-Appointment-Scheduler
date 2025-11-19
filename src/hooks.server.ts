import { handle as supabaseHandle } from '$lib/supabase/server';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = supabaseHandle;
