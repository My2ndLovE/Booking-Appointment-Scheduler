import { writable } from 'svelte/store';
import type { Organization } from '$lib/types/organization';

export const currentOrganization = writable<Organization | null>(null);
