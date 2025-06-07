import apiClient from "./services";

export default {
  getOwnedBook(token) {
    return apiClient.get("/OwnedBook/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  addOwnedBook(ownedBook, token) {
    return apiClient.post("/OwnedBook/", ownedBook, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  updateOwnedBook(ownedBookId, ownedBook, token) {
    return apiClient.put(`/OwnedBook/${ownedBookId}`, ownedBook, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  deleteOwnedBook(ownedBookId, token) {
    return apiClient.delete(`/OwnedBook/${ownedBookId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
