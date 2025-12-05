import { AxiosRequestConfig, Method } from "axios";
import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/interfaces/api.interface";

export async function apiRequest<TResponse = any, TBody = any>(
  url: string,
  method: Method = "GET",
  body?: TBody,
  config?: AxiosRequestConfig
): Promise<ApiResponse<TResponse>> {
  try {
    const response = await axiosInstance.request<TResponse>({
      url,
      method,
      data: body,
      ...config,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (err: any) {
    const message =
      err?.response?.data?.error ||
      err?.message ||
      "Unknown error occurred";

    return {
      success: false,
      message,
      status: err?.response?.status,
    };
  }
}
