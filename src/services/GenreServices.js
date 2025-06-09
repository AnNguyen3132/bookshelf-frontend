import apiClient from "./services";

export default {
  getGenres() {
    return apiClient.get("Genres");
  },
};
