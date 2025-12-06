import { axiosInstance } from "@/app/store/services/api";
import { API_ROUTES } from "@/constants/api.constant";

export const uploadVoiceTaskFn = async (audioUri: string) => {
  const formData = new FormData();
  
  // React Native FormData expects an object with uri, type, and name
  formData.append("audio", {
    uri: audioUri,
    type: "audio/m4a", // or 'audio/mp4' depending on recording settings
    name: "recording.m4a",
  } as any);

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
    console.error("Voice upload error", error);
    return { success: false, message: error.message };
  }
};
