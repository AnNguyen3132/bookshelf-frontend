import apiClient from "./services";

export default {
  getPublishers() {
    return apiClient.get("Publishers");
  },
};
