import api from "./apiClient";

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export type SellerRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SellerRequestResponse {
  id: number;
  userId: number;
  userEmail: string;
  userFullname: string;
  userAvatar: string;
  reason: string;
  businessName: string;
  businessAddress: string;
  phoneNumber: string;
  status: SellerRequestStatus;
  adminNote: string;
  reviewedBy: number;
  reviewerEmail: string;
  reviewedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSellerRequestDTO {
  reason: string;
  businessName?: string;
  businessAddress?: string;
  phoneNumber?: string;
}

export interface ReviewSellerRequestDTO {
  approved: boolean;
  adminNote?: string;
}

export interface SellerRequestStatistics {
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export const getAllSellerRequests = (page: number = 0, size: number = 10) =>
  api.get<ApiResponse<PageResponse<SellerRequestResponse>>>(
    "/api/user/admin/seller-requests",
    { params: { page, size } }
  );

export const getSellerRequestsByStatus = (
  status: SellerRequestStatus,
  page: number = 0,
  size: number = 10
) =>
  api.get<ApiResponse<PageResponse<SellerRequestResponse>>>(
    `/api/user/admin/seller-requests/status/${status}`,
    { params: { page, size } }
  );

export const searchSellerRequests = (
  keyword: string,
  page: number = 0,
  size: number = 10
) =>
  api.get<ApiResponse<PageResponse<SellerRequestResponse>>>(
    "/api/user/admin/seller-requests/search",
    { params: { keyword, page, size } }
  );

export const getSellerRequestById = (requestId: number) =>
  api.get<ApiResponse<SellerRequestResponse>>(
    `/api/user/admin/seller-requests/${requestId}`
  );

export const reviewSellerRequest = (
  requestId: number,
  request: ReviewSellerRequestDTO
) =>
  api.put<ApiResponse<SellerRequestResponse>>(
    `/api/user/admin/seller-requests/${requestId}/review`,
    request
  );

export const getSellerRequestStatistics = () =>
  api.get<ApiResponse<SellerRequestStatistics>>(
    "/api/user/admin/seller-requests/statistics"
  );

export const createSellerRequest = async (request: CreateSellerRequestDTO): Promise<SellerRequestResponse> => {
  const response = await api.post<ApiResponse<SellerRequestResponse>>(
    "/api/user/seller-request",
    request
  );
  return response.data.data;
};

export const getMySellerRequest = async (): Promise<SellerRequestResponse | null> => {
  try {
    const response = await api.get<ApiResponse<SellerRequestResponse>>(
      "/api/user/seller-request/my"
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; 
    }
    throw error;
  }
};

export const cancelMySellerRequest = async (): Promise<void> => {
  await api.delete<ApiResponse<null>>(
    "/api/user/seller-request/my"
  );
};
