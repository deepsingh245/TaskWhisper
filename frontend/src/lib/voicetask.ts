import { API_ROUTES } from "@/constants/auth.constant";
import { apiRequest } from "@/utils/api";

export const uploadVoiceTaskFn = (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  return apiRequest(
    API_ROUTES.TASK.VOICE_TASK,
    "POST",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000,
    }
  );
};
