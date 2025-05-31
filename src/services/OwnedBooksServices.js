import apiClient from "./services";

export default {
    getOwnedBook(userId) {
        return apiClient.get("/OwnedBook/", userId);
    },
    addOwnedBook(ownedBook) {
        return apiClient.post("/OwnedBook/", ownedBook);
    },
    updateOwnedBook(ownedBookId, ownedBook) {
        return apiClient.put("/OwnedBook/" + ownedBookId, ownedBook);
    },
    deleteOwnedBook(ownedBookId) {
        return apiClient.delete("/OwnedBook/" + ownedBookId)
  }
};