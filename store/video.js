// video.js
import { create } from "zustand";
import axios from "axios";

export const useVideo = create((set) => ({
  video: null,
  loading: false,
  notTiktokLink: false,

  // Fetch video function
  fetchVideo: async (url) => {
    set({ loading: true });

    const isValidUrl =
      /^(https?:\/\/)?(www\.)?(vm.tiktok\.com|tiktok\.com)\/.+$/.test(url);

    if (!isValidUrl) {
      console.log("NOT VALID LINK!");
      set({ notTiktokLink: true, loading: false, video: null });
      return;
    }

    try {
      const res = await axios.get(`https://www.tikwm.com/api/?url=${url}&hd=1`);

      if (res.data && res.data.data) {
        set({ video: res.data.data, notTiktokLink: false, loading: false });
      } else {
        set({ notTiktokLink: true, loading: false, video: null });
      }
    } catch (error) {
      console.log(error);
      set({ notTiktokLink: true, loading: false, video: null });
    }
  },

  // Clear video result
  clearVideo: () => {
    set({ video: null, notTiktokLink: false });
  },
}));
