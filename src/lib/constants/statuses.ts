export const BOOKING_STATUS = {
	PENDING: 'pending',
	CONFIRMED: 'confirmed',
	CANCELLED: 'cancelled',
	COMPLETED: 'completed',
	NO_SHOW: 'no_show'
} as const;

export const PAYMENT_STATUS = {
	UNPAID: 'unpaid',
	PAID: 'paid',
	REFUNDED: 'refunded'
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
	pending: 'warning',
	confirmed: 'success',
	cancelled: 'error',
	completed: 'tertiary',
	no_show: 'surface'
};
