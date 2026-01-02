import api from './apiClient';
import { ApiResponse } from './product';

export interface UserInfo {
  id: number;
  fullname: string;
  avatar: string | null;
  assessment: number | null;
}

export interface BlackListBidder {
  id: number;
  fullname: string;
  avatar: string | null;
}

export interface BlackListResponse {
  id: number;
  productId: number;
  bidder: BlackListBidder;
  createdAt: string;
  createdBy: number;
}

export interface BlackListPageResponse {
  content: BlackListResponse[];
  
  totalPages: number;
  totalElements: number;
}

export const getBlackListByProductId = async (
  productId: string | number,
  page: number = 0,
  size: number = 10
): Promise<BlackListPageResponse> => {
  const response = await api.get<ApiResponse<BlackListPageResponse>>(
    `/api/main/blacklist/product/${productId}`,
    {
      params: { page, size },
    }
  );

  return response.data.data;
};

export interface AutoBidItem {
  id: number;
  productId: number;
  bidder: UserInfo;
  createdAt: string;
  updatedAt: string;
}

export interface BidRequestItem {
  id: number;
  productId: number;
  bidder: UserInfo;
  sellerId: number;
  verified: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export const getAutoBidsByProductId = async (
  productId: string | number,
  page: number = 0,
  size: number = 5
): Promise<PageResponse<AutoBidItem>> => {
  const response = await api.get<ApiResponse<PageResponse<AutoBidItem>>>(
    `/api/main/auto-bid/product/${productId}`,
    {
      params: { page, size },
    }
  );

  return response.data.data;
};

export const getBidRequestsByProductId = async (
  productId: string | number,
  page: number = 0,
  size: number = 5
): Promise<PageResponse<BidRequestItem>> => {
  const response = await api.get<ApiResponse<PageResponse<BidRequestItem>>>(
    `/api/main/bid-request/product/${productId}`,
    {
      params: { page, size },
    }
  );

  return response.data.data;
};

export const checkUserCanBid = async (
  productId: string | number
): Promise<boolean> => {
  const response = await api.get<ApiResponse<boolean>>(
    `/api/main/auto-bid/check/${productId}`
  );
  return response.data.data;
};

export interface CreateAutoBidRequest {
  productId: number;
  maxPrice: number;
}

export const createAutoBid = async (
  request: CreateAutoBidRequest
): Promise<AutoBidItem> => {
  const response = await api.post<ApiResponse<AutoBidItem>>(
    '/api/main/auto-bid',
    {
      productId: request.productId,
      maxPrice: request.maxPrice,
    }
  );
  return response.data.data;
};

export interface BlockUserRequest {
  bidderId: number;
  productId: number;
}

export const blockUser = async (
  request: BlockUserRequest
): Promise<BlackListResponse> => {
  const response = await api.post<ApiResponse<BlackListResponse>>(
    '/api/main/blacklist',
    {
      bidderId: request.bidderId,
      productId: request.productId,
    }
  );
  return response.data.data;
};

export interface VerifyBidRequestRequest {
  bidderId: number;
  productId: number;
}

export const verifyBidRequest = async (
  request: VerifyBidRequestRequest
): Promise<BidRequestItem> => {
  const response = await api.post<ApiResponse<BidRequestItem>>(
    '/api/main/bid-request/verify',
    {
      bidderId: request.bidderId,
      productId: request.productId,
    }
  );
  return response.data.data;
};

