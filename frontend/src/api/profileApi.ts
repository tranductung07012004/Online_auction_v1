import api from './apiClient';

export interface UpdateFullnameRequest {
  fullname: string;
  password: string;
}

export interface UpdateEmailRequest {
  password: string;
  newEmail: string;
}

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateAddressRequest {
  address: string;
  password: string;
}

export interface UpdateAvatarRequest {
  avatar: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface UserProfileResponse {
  fullname: string;
  avatar: string;
  assessment: number | null;
  email: string; 
  address: string;
}

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  try {
    const response = await api.get<ApiResponse<UserProfileResponse>>(
      '/api/user/internal/profile'
    );
    return response.data.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || 'Failed to get user profile';
    throw new Error(errorMessage);
  }
};

export const updateFullname = async (
  data: UpdateFullnameRequest
): Promise<ApiResponse<null>> => {
  try {
    const response = await api.put<ApiResponse<null>>(
      '/api/user/internal/fullname',
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || 'Failed to update fullname';
    throw new Error(errorMessage);
  }
};

export const updateEmail = async (
  data: UpdateEmailRequest
): Promise<ApiResponse<null>> => {
  try {
    const response = await api.put<ApiResponse<null>>(
      '/api/user/internal/email',
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || 'Failed to update email';
    throw new Error(errorMessage);
  }
};

export const updatePassword = async (
  data: UpdatePasswordRequest
): Promise<ApiResponse<null>> => {
  try {
    const response = await api.put<ApiResponse<null>>(
      '/api/user/internal/password',
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || 'Failed to update password';
    throw new Error(errorMessage);
  }
};

export const updateAddress = async (
  data: UpdateAddressRequest
): Promise<ApiResponse<null>> => {
  try {
    const response = await api.put<ApiResponse<null>>(
      '/api/user/internal/address',
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || 'Failed to update address';
    throw new Error(errorMessage);
  }
};

export const updateAvatar = async (
  data: UpdateAvatarRequest
): Promise<ApiResponse<null>> => {
  try {
    const response = await api.put<ApiResponse<null>>(
      '/api/user/internal/avatar',
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || 'Failed to update avatar';
    throw new Error(errorMessage);
  }
};

