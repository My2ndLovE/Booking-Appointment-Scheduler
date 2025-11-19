import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'warning' | 'info';
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	function addToast(toast: Omit<Toast, 'id'>) {
		const id = Math.random().toString(36).substring(7);
		const newToast: Toast = { ...toast, id };

		update((toasts) => [...toasts, newToast]);

		// Auto remove after duration
		const duration = toast.duration || 3000;
		setTimeout(() => {
			removeToast(id);
		}, duration);

		return id;
	}

	function removeToast(id: string) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		success: (message: string, duration?: number) =>
			addToast({ message, type: 'success', duration }),
		error: (message: string, duration?: number) => addToast({ message, type: 'error', duration }),
		warning: (message: string, duration?: number) =>
			addToast({ message, type: 'warning', duration }),
		info: (message: string, duration?: number) => addToast({ message, type: 'info', duration }),
		remove: removeToast
	};
}

export const toast = createToastStore();
