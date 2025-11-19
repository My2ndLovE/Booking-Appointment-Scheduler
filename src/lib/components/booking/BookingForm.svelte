<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase/client';
	import { toast } from '$lib/stores/toast';
	import { authStore } from '$lib/stores/auth';
	import { bookingSchema } from '$lib/utils/validation';
	import { formatDate, formatTime, calculateEndTime } from '$lib/utils/date';
	import type { ServiceWithStaff } from '$lib/types/service';
	import type { StaffMemberWithUser } from '$lib/types/staff';
	import type { Organization } from '$lib/types/organization';

	export let selectedService: ServiceWithStaff;
	export let selectedStaff: StaffMemberWithUser;
	export let selectedDate: Date;
	export let selectedTime: string;
	export let organization: Organization;

	let customer_name = $authStore.profile?.full_name || '';
	let customer_email = $authStore.profile?.email || '';
	let customer_phone = $authStore.profile?.phone || '';
	let notes = '';
	let loading = false;
	let errors: Record<string, string> = {};

	const endTime = calculateEndTime(selectedTime, selectedService.duration_minutes);

	async function handleSubmit() {
		errors = {};
		loading = true;

		try {
			// Validate form
			const formData = bookingSchema.parse({
				customer_name,
				customer_email,
				customer_phone,
				notes
			});

			// Ensure user is authenticated
			if (!$authStore.session) {
				toast.error('Please sign in to book an appointment');
				goto(`/login?redirect=/book/${organization.slug}`);
				return;
			}

			// Create booking
			const { data: booking, error: bookingError } = await supabase
				.from('bookings')
				.insert({
					organization_id: organization.id,
					service_id: selectedService.id,
					staff_id: selectedStaff.id,
					customer_id: $authStore.session.user.id,
					booking_date: formatDate(selectedDate, 'yyyy-MM-dd'),
					start_time: selectedTime,
					end_time: endTime,
					timezone: organization.timezone,
					status: 'pending',
					price: selectedService.price,
					payment_status: 'unpaid',
					customer_name: formData.customer_name,
					customer_email: formData.customer_email,
					customer_phone: formData.customer_phone || null,
					notes: formData.notes || null
				})
				.select()
				.single();

			if (bookingError) {
				console.error('Booking error:', bookingError);
				toast.error('Failed to create booking. Please try again.');
				loading = false;
				return;
			}

			toast.success('Booking created successfully!');
			goto(`/book/${organization.slug}/success?booking=${booking.id}`);
		} catch (err: any) {
			if (err.errors) {
				err.errors.forEach((e: any) => {
					errors[e.path[0]] = e.message;
				});
			} else {
				toast.error('An error occurred. Please try again.');
			}
		} finally {
			loading = false;
		}
	}
</script>

<div>
	<h2 class="h2 mb-6">Confirm Your Booking</h2>

	<div class="grid md:grid-cols-2 gap-6">
		<!-- Booking Summary -->
		<div class="card p-6 h-fit">
			<h3 class="h3 mb-4">Booking Summary</h3>

			<div class="space-y-3">
				<div>
					<p class="text-sm opacity-75">Service</p>
					<p class="font-semibold">{selectedService.name}</p>
				</div>

				<div>
					<p class="text-sm opacity-75">Staff Member</p>
					<p class="font-semibold">{selectedStaff.user.full_name}</p>
				</div>

				<div>
					<p class="text-sm opacity-75">Date</p>
					<p class="font-semibold">{formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
				</div>

				<div>
					<p class="text-sm opacity-75">Time</p>
					<p class="font-semibold">{formatTime(selectedTime)} - {formatTime(endTime)}</p>
				</div>

				<div>
					<p class="text-sm opacity-75">Duration</p>
					<p class="font-semibold">{selectedService.duration_minutes} minutes</p>
				</div>

				<div class="pt-3 border-t">
					<p class="text-sm opacity-75">Total Price</p>
					<p class="text-2xl font-bold">
						${selectedService.price.toFixed(2)} {selectedService.currency}
					</p>
				</div>
			</div>
		</div>

		<!-- Customer Information Form -->
		<div class="card p-6">
			<h3 class="h3 mb-4">Your Information</h3>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<label class="label">
					<span>Full Name *</span>
					<input
						class="input"
						type="text"
						bind:value={customer_name}
						placeholder="John Doe"
						required
						disabled={loading}
					/>
					{#if errors.customer_name}
						<span class="text-error-500 text-sm">{errors.customer_name}</span>
					{/if}
				</label>

				<label class="label">
					<span>Email *</span>
					<input
						class="input"
						type="email"
						bind:value={customer_email}
						placeholder="john@example.com"
						required
						disabled={loading}
					/>
					{#if errors.customer_email}
						<span class="text-error-500 text-sm">{errors.customer_email}</span>
					{/if}
				</label>

				<label class="label">
					<span>Phone</span>
					<input
						class="input"
						type="tel"
						bind:value={customer_phone}
						placeholder="(555) 123-4567"
						disabled={loading}
					/>
					{#if errors.customer_phone}
						<span class="text-error-500 text-sm">{errors.customer_phone}</span>
					{/if}
				</label>

				<label class="label">
					<span>Notes (Optional)</span>
					<textarea
						class="textarea"
						bind:value={notes}
						placeholder="Any special requests or information..."
						rows="3"
						disabled={loading}
					/>
					{#if errors.notes}
						<span class="text-error-500 text-sm">{errors.notes}</span>
					{/if}
				</label>

				<button type="submit" class="btn variant-filled-primary w-full" disabled={loading}>
					{loading ? 'Creating Booking...' : 'Confirm Booking'}
				</button>

				<p class="text-sm text-surface-600 dark:text-surface-400 text-center">
					You'll receive a confirmation email at {customer_email}
				</p>
			</form>
		</div>
	</div>
</div>
