import axios from 'axios';

const api = axios.create({
  baseURL: '',
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  register: (username, email, password, bio, avatarUrl) => 
    api.post('/api/users/register', { username, email, password, bio, avatarUrl }),
  login: (username, password) => 
    api.post('/api/users/login', { username, password }),
  getProfile: (userId) => 
    api.get(`/api/users/profile/${userId}`),
  updateProfile: (userId, data) => 
    api.put(`/api/users/profile/${userId}`, data),
};

export const gameService = {
  getAllGames: () => 
    api.get('/api/games'),
  getGameById: (gameId) => 
    api.get(`/api/games/${gameId}`),
  searchGames: (keyword) => 
    api.get(`/api/games/search?keyword=${keyword}`),
  getGamesByGenre: (genre) => 
    api.get(`/api/games/genre/${genre}`),
  addGame: (data) =>
    api.post('/api/games', data),
};

export const reviewService = {
  createReview: (gameId, userId, username, rating, title, reviewText, pros, cons) => 
    api.post('/api/reviews', { gameId, userId, username, rating, title, reviewText, pros, cons }),
  getReviewsByGameId: (gameId) => 
    api.get(`/api/reviews/game/${gameId}`),
  getReviewsByUserId: (userId) => 
    api.get(`/api/reviews/user/${userId}`),
  upvoteReview: (reviewId) => 
    api.post(`/api/reviews/${reviewId}/upvote`),
  downvoteReview: (reviewId) => 
    api.post(`/api/reviews/${reviewId}/downvote`),
};

export const commentService = {
  createComment: (reviewId, userId, username, commentText) => 
    api.post('/api/comments', { reviewId, userId, username, commentText }),
  getCommentsByReviewId: (reviewId) => 
    api.get(`/api/comments/review/${reviewId}`),
  deleteComment: (commentId) => 
    api.delete(`/api/comments/${commentId}`),
};

export default api;
