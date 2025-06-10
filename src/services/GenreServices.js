import apiClient from "./services";

export default {
  getGenres() {
    return apiClient.get("Genres");
  },
  addGenre(genre) {
    return apiClient.post("/Genre/", genre)
  },
  updateGenre(genreId, Genre) {
    return apiClient.put("/Genre/" + genreId, Genre);
  },
  deleteGenre(genreId) {
    return apiClient.delete("/Genre/" + genreId);
  }
};

