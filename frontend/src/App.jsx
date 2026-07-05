import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, Search, Star, User, LogOut, LogIn, ThumbsUp, ThumbsDown, 
  MessageSquare, Plus, X, ArrowLeft, Edit3, Trash2, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { authService, gameService, reviewService, commentService } from './services/api';

export default function App() {
  // Navigation & Page State
  const [currentPage, setCurrentPage] = useState('home'); // home, details, profile, auth
  const [selectedGameId, setSelectedGameId] = useState(null);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // login, register
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '', bio: '', avatarUrl: '' });
  const [authError, setAuthError] = useState('');
  
  // Data States
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameReviews, setGameReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [commentsMap, setCommentsMap] = useState({}); // reviewId -> array of comments
  
  // UI States
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', reviewText: '', pros: '', cons: '' });
  const [reviewError, setReviewError] = useState('');
  const [commentInputs, setCommentInputs] = useState({}); // reviewId -> commentText
  const [profileEdit, setProfileEdit] = useState({ bio: '', avatarUrl: '', password: '' });
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Initial Boot
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    loadGames();
  }, []);

  // Fetch games
  const loadGames = async () => {
    try {
      const res = await gameService.getAllGames();
      setGames(res.data);
    } catch (err) {
      console.error("Error loading games", err);
    }
  };

  // Trigger search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      loadGames();
      return;
    }
    try {
      const res = await gameService.searchGames(searchKeyword);
      setGames(res.data);
    } catch (err) {
      console.error("Error searching games", err);
    }
  };

  // Genre filter
  const handleGenreSelect = async (genre) => {
    setSelectedGenre(genre);
    if (genre === 'All') {
      loadGames();
      return;
    }
    try {
      const res = await gameService.getGamesByGenre(genre);
      setGames(res.data);
    } catch (err) {
      console.error("Error filtering genre", err);
    }
  };

  // Open Game details page
  const handleViewGame = async (gameId) => {
    try {
      const gameRes = await gameService.getGameById(gameId);
      setSelectedGame(gameRes.data);
      setSelectedGameId(gameId);
      
      const reviewsRes = await reviewService.getReviewsByGameId(gameId);
      setGameReviews(reviewsRes.data);
      
      // Load comments for each review
      reviewsRes.data.forEach(r => loadCommentsForReview(r.id));
      
      setCurrentPage('details');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Error getting game details", err);
    }
  };

  // Load comments
  const loadCommentsForReview = async (reviewId) => {
    try {
      const res = await commentService.getCommentsByReviewId(reviewId);
      setCommentsMap(prev => ({ ...prev, [reviewId]: res.data }));
    } catch (err) {
      console.error("Error loading comments for review " + reviewId, err);
    }
  };

  // Auth Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') {
        const res = await authService.login(authForm.username, authForm.password);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        setCurrentPage('home');
      } else {
        const res = await authService.register(
          authForm.username, 
          authForm.email, 
          authForm.password, 
          authForm.bio, 
          authForm.avatarUrl
        );
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        setCurrentPage('home');
      }
      setAuthForm({ username: '', email: '', password: '', bio: '', avatarUrl: '' });
    } catch (err) {
      setAuthError(err.response?.data?.error || "Authentication failed. Please check inputs.");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentPage('home');
  };

  // Profile Page loading
  const navigateToProfile = async () => {
    if (!currentUser) {
      setCurrentPage('auth');
      return;
    }
    setProfileSuccess('');
    setProfileError('');
    try {
      // Reload profile
      const userRes = await authService.getProfile(currentUser.id);
      setCurrentUser(userRes.data);
      localStorage.setItem('user', JSON.stringify(userRes.data));
      setProfileEdit({ bio: userRes.data.bio || '', avatarUrl: userRes.data.avatarUrl || '', password: '' });
      
      // Load user reviews
      const reviewsRes = await reviewService.getReviewsByUserId(currentUser.id);
      setUserReviews(reviewsRes.data);
      
      setCurrentPage('profile');
    } catch (err) {
      console.error("Error navigating to profile", err);
    }
  };

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    try {
      const updateData = {
        bio: profileEdit.bio,
        avatarUrl: profileEdit.avatarUrl
      };
      if (profileEdit.password) {
        updateData.password = profileEdit.password;
      }
      
      const res = await authService.updateProfile(currentUser.id, updateData);
      setCurrentUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setProfileSuccess('Profile updated successfully!');
      setProfileEdit(prev => ({ ...prev, password: '' }));
    } catch (err) {
      setProfileError(err.response?.data?.error || "Failed to update profile.");
    }
  };

  // Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (!currentUser) {
      setReviewError("You must be logged in to submit a review.");
      return;
    }
    try {
      await reviewService.createReview(
        selectedGame.id,
        currentUser.id,
        currentUser.username,
        reviewForm.rating,
        reviewForm.title,
        reviewForm.reviewText,
        reviewForm.pros,
        reviewForm.cons
      );
      
      // Reset & Reload
      setIsReviewModalOpen(false);
      setReviewForm({ rating: 5, title: '', reviewText: '', pros: '', cons: '' });
      
      // Reload game reviews
      const reviewsRes = await reviewService.getReviewsByGameId(selectedGame.id);
      setGameReviews(reviewsRes.data);
    } catch (err) {
      setReviewError(err.response?.data?.error || "Failed to submit review.");
    }
  };

  // Upvote / Downvote Review
  const handleVote = async (reviewId, type) => {
    try {
      if (type === 'up') {
        await reviewService.upvoteReview(reviewId);
      } else {
        await reviewService.downvoteReview(reviewId);
      }
      
      // Reload reviews
      if (currentPage === 'details') {
        const reviewsRes = await reviewService.getReviewsByGameId(selectedGame.id);
        setGameReviews(reviewsRes.data);
      } else if (currentPage === 'profile') {
        const reviewsRes = await reviewService.getReviewsByUserId(currentUser.id);
        setUserReviews(reviewsRes.data);
      }
    } catch (err) {
      console.error("Voting failed", err);
    }
  };

  // Submit Comment
  const handleCommentSubmit = async (e, reviewId) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to comment.");
      return;
    }
    const text = commentInputs[reviewId];
    if (!text || !text.trim()) return;

    try {
      await commentService.createComment(reviewId, currentUser.id, currentUser.username, text);
      setCommentInputs(prev => ({ ...prev, [reviewId]: '' }));
      loadCommentsForReview(reviewId);
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId, reviewId) => {
    try {
      await commentService.deleteComment(commentId);
      loadCommentsForReview(reviewId);
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0b0c10]/90 backdrop-blur-md border-b border-darkBorder glow-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => { setCurrentPage('home'); setSelectedGameId(null); setSelectedGenre('All'); loadGames(); }}
          >
            <div className="p-2 bg-gradient-to-tr from-neonPurple to-neonPink rounded-lg text-white shadow-glow-purple group-hover:scale-105 transition-transform duration-200">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <span className="font-orbitron text-xl font-black tracking-widest bg-gradient-to-r from-white via-gray-200 to-neonPurple bg-clip-text text-transparent">
              GAME<span className="text-neonPurple">SPHERE</span>
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <button 
              onClick={() => { setCurrentPage('home'); setSelectedGameId(null); setSelectedGenre('All'); loadGames(); }}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${currentPage === 'home' ? 'text-neonPurple font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              Browse Games
            </button>
            {currentUser ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={navigateToProfile}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${currentPage === 'profile' ? 'text-neonPurple font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full border border-neonPurple" />
                  <span>{currentUser.username}</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 text-red-400 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setAuthMode('login'); setCurrentPage('auth'); }}
                className="flex items-center gap-1 bg-gradient-to-r from-neonPurple to-neonPink hover:shadow-glow-purple text-white px-4 py-2 rounded-lg text-sm font-bold glow-transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Join/Login</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ================= HOME PAGE ================= */}
        {currentPage === 'home' && (
          <div className="space-y-10">
            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#181a24] to-[#121420] border border-darkBorder p-8 md:p-16 text-center space-y-6 shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neonPurple via-neonPink to-transparent pointer-events-none" />
              
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-neonPurple border border-neonPurple/30 bg-neonPurple/5 inline-block">
                COMMUNITY DRIVEN GAMING REVIEW PLATFORM
              </span>
              <h1 className="font-orbitron text-4xl md:text-6xl font-black tracking-tight leading-none text-white max-w-3xl mx-auto">
                Discover Your Next <span className="bg-gradient-to-r from-neonPurple to-neonPink bg-clip-text text-transparent">Favorite Game</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-xl mx-auto font-light">
                Browse detailed experiences, view real pros &amp; cons, and participate in honest gaming discussions with fellow gamers.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-md mx-auto flex items-center relative">
                <input 
                  type="text" 
                  placeholder="Search games (e.g. Elden Ring, RPG)..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-full py-3 pl-5 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-neonPurple glow-transition"
                />
                <button type="submit" className="absolute right-2 p-2 bg-neonPurple hover:bg-neonPurple/85 text-white rounded-full transition-colors duration-200">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Genre Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              {['All', 'RPG', 'Action', 'Shooter', 'Sandbox'].map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreSelect(genre)}
                  className={`px-4 py-2 rounded-full text-sm font-bold glow-transition border ${
                    selectedGenre === genre 
                      ? 'bg-gradient-to-r from-neonPurple to-neonPink border-transparent text-white shadow-glow-purple' 
                      : 'bg-darkCard hover:bg-[#1f2331] text-gray-400 border-darkBorder hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Games Grid */}
            <div className="space-y-4">
              <h2 className="font-orbitron text-2xl font-bold tracking-wider border-l-4 border-neonPurple pl-3 text-white">
                {selectedGenre === 'All' ? 'Trending Games' : `${selectedGenre} Games`}
              </h2>
              
              {games.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-xl border border-darkBorder space-y-3">
                  <ShieldAlert className="w-12 h-12 text-gray-600 mx-auto" />
                  <p className="text-gray-400 text-lg">No games found matching selection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {games.map((game) => (
                    <div 
                      key={game.id}
                      onClick={() => handleViewGame(game.id)}
                      className="group flex flex-col glass-panel hover:bg-[#171924] rounded-xl overflow-hidden border border-darkBorder hover:border-neonPurple/50 cursor-pointer glow-transition shadow-lg transform hover:-translate-y-1 duration-300"
                    >
                      {/* Image container */}
                      <div className="relative aspect-video overflow-hidden">
                        <img 
                          src={game.imageUrl} 
                          alt={game.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#0b0c10]/80 backdrop-blur-md px-2 py-1 rounded-md border border-yellow-500/30 text-yellow-500 text-xs font-black">
                          <Star className="w-3 h-3 fill-yellow-500" />
                          <span>{game.rating}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-neonPurple font-extrabold tracking-widest uppercase">
                            {game.genre}
                          </span>
                          <h3 className="font-bold text-lg text-white group-hover:text-neonPurple transition-colors duration-200 line-clamp-1">
                            {game.name}
                          </h3>
                          <p className="text-xs text-gray-400 line-clamp-2 font-light leading-relaxed">
                            {game.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-darkBorder text-[11px] text-gray-500 font-semibold">
                          <span>{game.platform}</span>
                          <span>{game.releaseYear}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= GAME DETAILS PAGE ================= */}
        {currentPage === 'details' && selectedGame && (
          <div className="space-y-8">
            {/* Back button */}
            <button 
              onClick={() => { setCurrentPage('home'); setSelectedGameId(null); }}
              className="inline-flex items-center gap-2 hover:text-neonPurple font-bold text-sm text-gray-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Games</span>
            </button>

            {/* Game Overview Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 glass-panel rounded-2xl p-6 md:p-8 border border-darkBorder shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neonPurple via-transparent to-transparent pointer-events-none" />
              
              <div className="rounded-xl overflow-hidden shadow-lg border border-darkBorder aspect-video md:aspect-[3/4]">
                <img src={selectedGame.imageUrl} alt={selectedGame.name} className="w-full h-full object-cover" />
              </div>

              <div className="md:col-span-2 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-neonPurple/10 border border-neonPurple/40 text-neonPurple px-3 py-1 rounded-full text-xs font-bold">
                      {selectedGame.genre}
                    </span>
                    <span className="bg-darkBorder border border-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-bold">
                      {selectedGame.platform}
                    </span>
                  </div>

                  <h1 className="font-orbitron text-3xl md:text-5xl font-black text-white">
                    {selectedGame.name}
                  </h1>

                  <p className="text-gray-300 leading-relaxed text-sm md:text-base font-light">
                    {selectedGame.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-darkBorder">
                  <div className="bg-[#0b0c10]/40 p-3 rounded-lg border border-darkBorder text-center">
                    <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Release Year</span>
                    <span className="text-lg font-bold text-white">{selectedGame.releaseYear}</span>
                  </div>
                  <div className="bg-[#0b0c10]/40 p-3 rounded-lg border border-darkBorder text-center">
                    <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Platform</span>
                    <span className="text-lg font-bold text-white line-clamp-1">{selectedGame.platform}</span>
                  </div>
                  <div className="bg-[#0b0c10]/40 p-3 rounded-lg border border-darkBorder text-center col-span-2">
                    <span className="text-[10px] text-yellow-500/70 font-bold block uppercase tracking-wider">Rating</span>
                    <span className="text-lg font-black text-yellow-500 flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-500" />
                      <span>{selectedGame.rating} / 5.0</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-darkBorder pb-4">
                <h2 className="font-orbitron text-xl md:text-2xl font-black tracking-wider text-white">
                  Gamers Reviews &amp; Opinions
                </h2>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      setAuthMode('login');
                      setCurrentPage('auth');
                    } else {
                      setReviewError('');
                      setIsReviewModalOpen(true);
                    }
                  }}
                  className="flex items-center gap-1 bg-gradient-to-r from-neonPurple to-neonPink hover:shadow-glow-purple text-white px-4 py-2 rounded-lg text-sm font-bold glow-transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Share My View</span>
                </button>
              </div>

              {/* Review Feed */}
              {gameReviews.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-2xl border border-darkBorder space-y-4">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-white font-bold text-lg">No reviews yet</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">Be the first to share your thoughts, pros, and cons about {selectedGame.name}!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {gameReviews.map((review) => (
                    <div 
                      key={review.id}
                      className="glass-panel border border-darkBorder hover:border-gray-800 rounded-2xl p-6 glow-transition space-y-4 shadow-lg"
                    >
                      {/* Review Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border border-neonPurple overflow-hidden bg-slate-900">
                            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${review.username}`} alt="Avatar" className="w-full h-full" />
                          </div>
                          <div>
                            <span className="font-bold text-white block text-sm">{review.username}</span>
                            <span className="text-[10px] text-gray-500 block font-semibold">
                              {new Date(review.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-2 py-1 rounded-md text-xs font-black">
                          <Star className="w-3.5 h-3.5 fill-yellow-500" />
                          <span>{review.rating} / 5</span>
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-white text-base md:text-lg">{review.title}</h4>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line font-light">
                          {review.reviewText}
                        </p>
                      </div>

                      {/* Pros & Cons */}
                      {(review.pros || review.cons) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {review.pros && (
                            <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl space-y-2">
                              <span className="text-xs font-black text-emerald-400 tracking-wider block uppercase">Pros</span>
                              <div className="flex flex-wrap gap-1.5">
                                {review.pros.split(',').map((p, idx) => (
                                  <span key={idx} className="bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                    + {p.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {review.cons && (
                            <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl space-y-2">
                              <span className="text-xs font-black text-rose-400 tracking-wider block uppercase">Cons</span>
                              <div className="flex flex-wrap gap-1.5">
                                {review.cons.split(',').map((c, idx) => (
                                  <span key={idx} className="bg-rose-950/60 border border-rose-800/40 text-rose-400 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                    - {c.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Upvotes / Comments count */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-darkBorder">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleVote(review.id, 'up')}
                            className="flex items-center gap-1.5 bg-darkCard hover:bg-[#202433] border border-darkBorder hover:border-neonPurple/30 text-gray-400 hover:text-neonPurple px-3 py-1.5 rounded-lg text-xs font-bold glow-transition"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{review.upvotes}</span>
                          </button>
                          <button 
                            onClick={() => handleVote(review.id, 'down')}
                            className="flex items-center gap-1.5 bg-darkCard hover:bg-[#202433] border border-darkBorder hover:border-neonPink/30 text-gray-400 hover:text-neonPink px-3 py-1.5 rounded-lg text-xs font-bold glow-transition"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>{review.downvotes}</span>
                          </button>
                        </div>

                        <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{commentsMap[review.id]?.length || 0} Comments</span>
                        </span>
                      </div>

                      {/* Inline Comments Section */}
                      <div className="bg-[#0b0c10]/50 border border-darkBorder/60 rounded-xl p-4 space-y-4">
                        <h5 className="text-xs font-black text-gray-400 uppercase tracking-wider">Comments Feed</h5>

                        {/* List Comments */}
                        {commentsMap[review.id]?.length === 0 ? (
                          <p className="text-xs text-gray-500 italic">No comments on this view yet.</p>
                        ) : (
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {commentsMap[review.id]?.map((cmt) => (
                              <div key={cmt.id} className="flex gap-2.5 items-start bg-[#121420]/40 p-2.5 rounded-lg border border-darkBorder/40">
                                <div className="w-6.5 h-6.5 rounded-full border border-neonPurple overflow-hidden bg-slate-900 shrink-0">
                                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${cmt.username}`} alt="Avatar" className="w-full h-full" />
                                </div>
                                <div className="flex-grow space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-neonCyan">{cmt.username}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] text-gray-500">
                                        {new Date(cmt.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' })}
                                      </span>
                                      {currentUser && currentUser.username === cmt.username && (
                                        <button 
                                          onClick={() => handleDeleteComment(cmt.id, review.id)}
                                          className="text-gray-500 hover:text-red-500 transition-colors"
                                          title="Delete comment"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-300 font-light">{cmt.commentText}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment Input */}
                        <form 
                          onSubmit={(e) => handleCommentSubmit(e, review.id)}
                          className="flex gap-2 items-center"
                        >
                          <input 
                            type="text" 
                            placeholder={currentUser ? "Add to the discussion..." : "Login to write a comment"}
                            disabled={!currentUser}
                            value={commentInputs[review.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [review.id]: e.target.value }))}
                            className="flex-grow bg-[#0b0c10]/80 border border-darkBorder focus:border-neonCyan text-xs rounded-lg p-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neonCyan glow-transition"
                          />
                          <button 
                            type="submit" 
                            disabled={!currentUser}
                            className="bg-neonCyan hover:bg-neonCyan/85 text-black px-4 py-2.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-40"
                          >
                            Reply
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write Review Modal */}
            {isReviewModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
                <div className="w-full max-w-xl glass-panel border border-darkBorder rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-darkBorder">
                    <h3 className="font-orbitron text-lg font-black text-white">
                      Reviewing: <span className="text-neonPurple">{selectedGame.name}</span>
                    </h3>
                    <button 
                      onClick={() => setIsReviewModalOpen(false)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-darkCard rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Form */}
                  <form onSubmit={handleReviewSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
                    {reviewError && (
                      <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-red-400 text-xs flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{reviewError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Rating select */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Rating Score</label>
                        <select 
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                          className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neonPurple"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ (5/5 Excellence)</option>
                          <option value="4">⭐⭐⭐⭐ (4/5 Great)</option>
                          <option value="3">⭐⭐⭐ (3/5 Average)</option>
                          <option value="2">⭐⭐ (2/5 Subpar)</option>
                          <option value="1">⭐ (1/5 Avoid)</option>
                        </select>
                      </div>

                      {/* Title */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Review Title</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Masterpiece of open-world design!"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neonPurple"
                        />
                      </div>
                    </div>

                    {/* Review text */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Detailed Experience</label>
                      <textarea 
                        rows={4}
                        required
                        placeholder="Write down your thoughts, pros, cons, and gameplay experience..."
                        value={reviewForm.reviewText}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                        className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neonPurple"
                      />
                    </div>

                    {/* Pros */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-emerald-400 uppercase tracking-wider">Pros (Comma separated)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Graphics, Combat mechanism, Rich story"
                        value={reviewForm.pros}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, pros: e.target.value }))}
                        className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-emerald-500 rounded-lg p-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Cons */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-rose-400 uppercase tracking-wider">Cons (Comma separated)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Minor bugs, Steep price, Long grind"
                        value={reviewForm.cons}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, cons: e.target.value }))}
                        className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-rose-500 rounded-lg p-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    {/* Submit buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-darkBorder">
                      <button 
                        type="button"
                        onClick={() => setIsReviewModalOpen(false)}
                        className="bg-darkCard hover:bg-[#202433] border border-darkBorder text-gray-400 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="bg-gradient-to-r from-neonPurple to-neonPink text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-shadow hover:shadow-glow-purple"
                      >
                        Publish View
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= PROFILE PAGE ================= */}
        {currentPage === 'profile' && currentUser && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile configuration */}
            <div className="lg:col-span-1 glass-panel border border-darkBorder rounded-2xl p-6 space-y-6 h-fit">
              <div className="text-center space-y-3">
                <div className="w-24 h-24 rounded-full border-2 border-neonPurple overflow-hidden mx-auto shadow-lg bg-slate-900">
                  <img src={currentUser.avatarUrl} alt="Profile Avatar" className="w-full h-full" />
                </div>
                <div>
                  <h2 className="font-orbitron text-xl font-black text-white">{currentUser.username}</h2>
                  <span className="text-xs text-gray-500 font-medium">{currentUser.email}</span>
                </div>
                <p className="text-xs text-gray-400 italic font-light px-4 bg-[#0b0c10]/40 py-2.5 rounded-xl border border-darkBorder/40">
                  {currentUser.bio || "This user hasn't written a bio yet."}
                </p>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleUpdateProfile} className="space-y-4 border-t border-darkBorder pt-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-neonPurple" />
                  <span>Update Profile Details</span>
                </h3>

                {profileSuccess && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-red-400 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Bio Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Tell us about your gaming hobbies..."
                    value={profileEdit.bio}
                    onChange={(e) => setProfileEdit(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neonPurple"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Avatar Image URL</label>
                  <input 
                    type="text"
                    placeholder="https://api.dicebear.com/..."
                    value={profileEdit.avatarUrl}
                    onChange={(e) => setProfileEdit(prev => ({ ...prev, avatarUrl: e.target.value }))}
                    className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">New Password (leave blank to keep)</label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    value={profileEdit.password}
                    onChange={(e) => setProfileEdit(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-neonPurple to-neonPink hover:shadow-glow-purple text-white text-xs font-bold py-2.5 rounded-lg glow-transition"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>

            {/* User reviews list */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="font-orbitron text-xl font-bold tracking-wider text-white border-l-4 border-neonPurple pl-3">
                My Posted Game Reviews
              </h2>

              {userReviews.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-2xl border border-darkBorder space-y-4">
                  <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-white font-bold text-base">You haven't written any reviews yet</h3>
                    <p className="text-gray-400 text-xs">Browse the gaming lists, select a title and share your experiences!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userReviews.map((review) => (
                    <div 
                      key={review.id}
                      className="glass-panel border border-darkBorder rounded-2xl p-5 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-darkBorder/60 pb-3">
                        <span className="text-xs font-extrabold text-neonCyan tracking-widest uppercase">
                          Game ID Reference: #{review.gameId}
                        </span>
                        
                        <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-2 py-0.5 rounded text-xs font-black">
                          <Star className="w-3 h-3 fill-yellow-500" />
                          <span>{review.rating} / 5</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-base">{review.title}</h4>
                        <p className="text-gray-300 text-xs leading-relaxed line-clamp-3 font-light">
                          {review.reviewText}
                        </p>
                      </div>

                      {/* Vote totals */}
                      <div className="flex gap-4 pt-3 border-t border-darkBorder/40">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{review.upvotes} Upvotes</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>{review.downvotes} Downvotes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= AUTHENTICATION PAGE ================= */}
        {currentPage === 'auth' && (
          <div className="max-w-md mx-auto py-12">
            <div className="glass-panel border border-darkBorder rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neonPink via-transparent to-transparent pointer-events-none" />
              
              <div className="text-center space-y-2">
                <h2 className="font-orbitron text-2xl font-black tracking-wider text-white">
                  {authMode === 'login' ? 'Gamer Verification' : 'Create Gamertag'}
                </h2>
                <p className="text-xs text-gray-400">
                  {authMode === 'login' ? 'Sign in to access rating, upvoting and commenting' : 'Register a username to join the GameSphere community'}
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-red-400 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Username</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. PixelMaster"
                    value={authForm.username}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none"
                  />
                </div>

                {authMode === 'register' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="e.g. gamer@example.com"
                        value={authForm.email}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Bio (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. RPG enthusiast & speedrunner"
                        value={authForm.bio}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Custom Avatar Image URL (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="https://example.com/avatar.png"
                        value={authForm.avatarUrl}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, avatarUrl: e.target.value }))}
                        className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-neonPurple to-neonPink hover:shadow-glow-purple text-white font-bold py-3 rounded-lg text-sm transition-shadow glow-transition"
                >
                  {authMode === 'login' ? 'Authenticate Account' : 'Register Gamertag'}
                </button>
              </form>

              <div className="border-t border-darkBorder pt-4 text-center">
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                  className="text-xs text-neonCyan hover:underline font-bold"
                >
                  {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have a gamertag? Sign in'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#090a0f] border-t border-darkBorder py-6 text-center text-xs text-gray-500 font-semibold">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-neonPurple" />
            <span className="font-orbitron tracking-widest text-white text-[10px] font-black">
              GAME<span className="text-neonPurple">SPHERE</span>
            </span>
          </div>
          <span>&copy; {new Date().getFullYear()} GameSphere Community. All Rights Reserved. Built with Spring Boot &amp; React.</span>
        </div>
      </footer>
    </div>
  );
}
