import apiClient from "./services";

export default {
  getPublishers() {
    return apiClient.get("Publishers");
  },
  addPublisher(publisher) {
    return apiClient.post("/Publisher/", publisher);
  },
  updatePublisher(publisherId, Publisher) {
    return apiClient.put("/Publisher/" + publisherId, Publisher);
  },
  deletePublisher(publisherId) {
    return apiClient.delete("/Publisher/" + publisherId)
  }
};
