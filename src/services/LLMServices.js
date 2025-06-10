import apiClient from "./services";

export default {
  getRecommendations(books) {
    return apiClient.post("recommend", books);
  }
};