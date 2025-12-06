import { axiosInstance } from "@/store/services/api";
import { API_ROUTES } from "@/constants/api.constant";

export const uploadVoiceTaskFn = async (audioBlob: Blob, language: string) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  formData.append("language", language);

  try {
    const response = await axiosInstance.post(
      API_ROUTES.VOICE.CREATE_TASK,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
