import { ApiResponse } from "@/types/common";
import { apiService } from "./api-service";

export const videoService = {
  async getVideoURL(path:string): Promise<any> {
    const res = await apiService.get<ApiResponse<any>>(`/pns/ads/generate-url/download?video_path=${path}`);
    return res;
  },
    async generateVideo(form: FormData): Promise<any> {
    // Backend expects multipart form-data fields:
    // template, campaign_id, video_path, poster (File)
    // Video generation can take time; override default 10s timeout
    return await apiService.post<any>("/pns/ads/video-gen", form, { timeout: 15000000 });
  },
};
