import apiClient from "./services";

export default {
  getWishlistBook(token) {
    return apiClient.get("/WishlistBook/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  addWishlistBook(wishlistBook, token) {
    return apiClient.post("/WishlistBook/", wishlistBook, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  updateWishlistBook(wishlistBookId, wishlistBook, token) {
    return apiClient.put(`/WishlistBook/${wishlistBookId}`, wishlistBook, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  deleteOwnedBook(wishlistBookId, token) {
    return apiClient.delete(`/WishlistBook/${wishlistBookId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
