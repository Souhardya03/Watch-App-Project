import { baseApi } from "../baseApi";

interface IListing {
	error: boolean;
	message: string;
	success: boolean;
	data: [
		{
			bookings: [];
			description: string;
			id: number;
			images: [
				{
					id: number;
					url: string;
				}
			];
			reviews: [
				{
					id: number;
					content: string;
					rating: number;
				}
			];
			title: string;
			type: string;
			user: {
				id: number;
				name: string;
				email: string;
			};
			doubleOccupancy: number;
			singleOccupancy: number;
		}
	];
}

interface IListingById {
	error: boolean;
	message: string;
	success: boolean;
	data: {
		bookings: [];
		description: string;
		id: number;
		images: [
			{
				id: number;
				url: string;
			}
		];
		reviews: [];
		title: string;
		type: string;
		user: {
			id: number;
			name: string;
			email: string;
		};
		doubleOccupancy: number;
		singleOccupancy: number;
	};
}

interface IResponse {
	error: boolean;
	message: string;
	success: boolean;
}

export const listingApi = baseApi
	.enhanceEndpoints({
		addTagTypes: [
			"Listing",
			"getListingbyID",
			"check-availality",
			"create-booking",
			"delete-booking",
			"create-review",
			"create-payment",
		],
	})
	.injectEndpoints({
		endpoints: (builder) => ({
			getListings: builder.query<IListing, { search?: string }>({
				query: ({ search = "" }) => ({
					url: "/rooms",
					method: "GET",
					credentials: "include",
				}),
				providesTags: ["Listing"],
			}),
			getListingById: builder.query<IListingById, { id: string }>({
				query: ({ id }) => ({
					url: `/rooms/${id}`,
					method: "GET",
					credentials: "include",
				}),
				providesTags: ["getListingbyID"],
			}),

			checkAvailability: builder.mutation<
				IResponse,
				{ id: string; startDate: Date; endDate: Date }
			>({
				query: ({ id, startDate, endDate }) => ({
					url: `/bookings/check-availability/${id}`,
					method: "POST",
					body: { startDate, endDate },
					credentials: "include",
				}),
				invalidatesTags: ["check-availality"],
			}),
			createPayment: builder.mutation<any, any>({
				query: (data) => ({
					url: `/bookings/create-payment`,
					method: "POST",
					body: data,
					credentials: "include",
				}),
				invalidatesTags: ["create-payment"],
			}),
			createBooking: builder.mutation<IResponse, { id: string; data: any }>({
				query: ({ id, data }) => ({
					url: `/bookings/create/${id}`,
					method: "POST",
					body: data,
					credentials: "include",
				}),
				invalidatesTags: ["create-booking"],
			}),
			deleteBooking: builder.mutation<IResponse, string>({
				query: (id) => ({
					url: `/bookings/delete/${id}`,
					method: "DELETE",
					credentials: "include",
				}),
				invalidatesTags: ["delete-booking"],
			}),
			createReview: builder.mutation<IResponse, { id: number; data: any }>({
				query: ({ id, data }) => ({
					url: `/reviews/create/${id}`,
					method: "POST",
					body: data,
					credentials: "include",
				}),
				invalidatesTags: ["create-review"],
			}),
			getBookingbyId: builder.query<any, any>({
				query: (id) => ({
					url: `/bookings/get-booking/${id}`,
					method: "GET",
					credentials: "include",
				}),
			}),
		}),
	});
export const {
	useGetListingsQuery,
	useGetListingByIdQuery,
	useCheckAvailabilityMutation,
	useCreateBookingMutation,
	useDeleteBookingMutation,
	useCreateReviewMutation,
	useGetBookingbyIdQuery,
	useCreatePaymentMutation,
} = listingApi;
