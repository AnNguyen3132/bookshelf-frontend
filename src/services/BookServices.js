import apiClient from "./services";

export default {
  getBooks() {
    return apiClient.get("Books");
  },
  getBook(id) {
    return apiClient.get(`Book/${id}`);
  },
  addBook(book) {
    return apiClient.post("Books/", book);
  },
  updateBook(book) {
    return apiClient.put(`Books/${book.id}`, book);
  },
  deleteBook(bookId) {
    return apiClient.delete(`Books/${bookId}`);
  },
};
