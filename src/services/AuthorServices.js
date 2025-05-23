import apiClient from "./services";

export default {
  getAuthor() {
    return apiClient.get("Authors");
  },
  addAuthor(author) {
    return apiClient.post("/Author/", author);
  },
  updateAuthor(authorID, Author) {
    return apiClient.put("/Author/" + authorID, Author);
  },
  deleteAuthor(authorID) {
    return apiClient.delete("/Author/" + authorID)
  }
};
