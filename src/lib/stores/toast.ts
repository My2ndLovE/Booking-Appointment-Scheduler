import { writable } from 'svelte/store';
import { TOAST_DURATION } from '$lib/constants/app';

export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'warning' | 'info';
	duration?: number;
}

/**
 * Generate a unique ID for toasts using crypto API if available
 * Falls back to timestamp + random for older browsers
 */
function generateToastId(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	// Fallback for environments without crypto.randomUUID
	return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);
	const timers = new Map<string, ReturnType<typeof setTimeout>>();

	function addToast(toast: Omit<Toast, 'id'>) {
		const id = generateToastId();
		const newToast: Toast = { ...toast, id };

		update((toasts) => {
			// Limit to max 5 toasts at once
			const newToasts = [...toasts, newToast];
			return newToasts.slice(-5);
		});

		// Auto remove after duration
		const duration = toast.duration ?? TOAST_DURATION;
		const timer = setTimeout(() => {
			removeToast(id);
		}, duration);

		timers.set(id, timer);

		return id;
	}

	function removeToast(id: string) {
		// Clear timeout if exists
		const timer = timers.get(id);
		if (timer) {
			clearTimeout(timer);
			timers.delete(id);
		}

		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	function clearAll() {
		// Clear all timers
		timers.forEach((timer) => clearTimeout(timer));
		timers.clear();

		// Clear all toasts
		update(() => []);
	}

	return {
		subscribe,
		success: (message: string, duration?: number) =>
			addToast({ message, type: 'success', duration }),
		error: (message: string, duration?: number) => addToast({ message, type: 'error', duration }),
		warning: (message: string, duration?: number) =>
			addToast({ message, type: 'warning', duration }),
		info: (message: string, duration?: number) => addToast({ message, type: 'info', duration }),
		remove: removeToast,
		clear: clearAll
	};
}

export const toast = createToastStore();
