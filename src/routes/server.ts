export const recentlyReleasedChaptersRoute =
  "/chapter/public/recently-released";
export const newSeriesRoute = "/series/public/new";
export const latestUpdatesRoute = "/chapter/public/latest-updates";
export const latestChaptersRoute = "/chapter/public/latest";
export const latestSeriesRoute = "/series/public/latest";
export const popularTodaySeriesRoute = "/series/public/popular-today";
export const mostPopularSeriesRoute = "/series/public/most-popular";
export const allSeriesRoute = "/series/public/all";
export const categoriesRoute = "/category";
export const seriesDetailsRoute = (slug: string) => `/series/public/${slug}`;
export const chapterReaderRoute = (slug: string, chapterNumber: number) =>
  `/chapter/public/series/${slug}/chapter/${chapterNumber}`;
export const readerLoginRoute = "/account/reader/login";
export const readerRegisterRoute = "/account/reader/register";
export const getCurrentUserRoute = "/account/me";
export const logoutRoute = "/account/logout";
export const bookmarkSeriesRoute = (seriesId: string) =>
  `/bookmark/series/${seriesId}`;
export const removeBookmarkRoute = (seriesId: string) =>
  `/bookmark/series/${seriesId}`;
export const checkBookmarkRoute = (seriesId: string) =>
  `/bookmark/series/${seriesId}`;
export const getUserBookmarksRoute = "/bookmark/series";
export const getLastReadChapterRoute = (seriesId: string) =>
  `/reading-progress/series/${seriesId}`;
export const setLastReadChapterRoute = (seriesId: string) =>
  `/reading-progress/series/${seriesId}`;
export const getOngoingSeriesRoute = "/reading-progress/ongoing";
export const likeSeriesRoute = (seriesId: string) => `/like/series/${seriesId}`;
export const unlikeSeriesRoute = (seriesId: string) =>
  `/like/series/${seriesId}`;
export const checkLikeRoute = (seriesId: string) => `/like/series/${seriesId}`;
export const purchaseChapterRoute = (chapterId: string) =>
  `/chapter/purchase/${chapterId}`;
export const createCoinPurchaseOrderRoute = "/payment/coins/create-order";
export const verifyPaymentRoute = "/payment/coins/verify";
export const getUserCoinPurchasesRoute = "/payment/coins/purchases";
export const getCoinPurchaseRoute = (purchaseId: string) =>
  `/payment/coins/purchase/${purchaseId}`;
export const getCryptoCurrenciesRoute = "/payment/crypto/currencies";
export const getCryptoMinimumAmountRoute = (currency: string) =>
  `/payment/crypto/minimum/amount/${currency}`;
export const getCryptoEstimateRoute = (currency: string) =>
  `/payment/crypto/estimate/${currency}`;
export const createCommentRoute = "/comment";
export const getSeriesCommentsRoute = (seriesId: string) =>
  `/comment/series/${seriesId}`;
export const getChapterCommentsRoute = (chapterId: string) =>
  `/comment/chapter/${chapterId}`;
export const deleteCommentRoute = (commentId: string) =>
  `/comment/${commentId}`;
export const rateSeriesRoute = (seriesId: string) => `/series/${seriesId}/rate`;
export const getUserRatingRoute = (seriesId: string) =>
  `/series/${seriesId}/my-rating`;
export const upcomingReleasesRoute = "/chapter/public/upcoming";
export const featuredSeriesRoute = "/series/public/featured";
export const risingStarsRoute = "/series/public/rising-stars";
export const readerDiscordAuthenticateRoute =
  "/account/reader/discord/authenticate";
export const readerGoogleAuthenticateRoute =
  "/account/reader/google/authenticate";
export const forgotPasswordRoute = "/account/forgot-password";
export const resetPasswordRoute = "/account/reset-password";
export const validateResetTokenRoute = "/account/validate-reset-token";
export const freeChaptersRoute = "/chapter/public/free";
