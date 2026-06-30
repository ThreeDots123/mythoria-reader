import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  newSeriesRoute,
  recentlyReleasedChaptersRoute,
  latestUpdatesRoute,
  latestChaptersRoute,
  latestSeriesRoute,
  popularTodaySeriesRoute,
  mostPopularSeriesRoute,
  allSeriesRoute,
  categoriesRoute,
  seriesDetailsRoute,
  chapterReaderRoute,
  readerLoginRoute,
  readerRegisterRoute,
  getCurrentUserRoute,
  logoutRoute,
  bookmarkSeriesRoute,
  removeBookmarkRoute,
  checkBookmarkRoute,
  getUserBookmarksRoute,
  getLastReadChapterRoute,
  setLastReadChapterRoute,
  getOngoingSeriesRoute,
  likeSeriesRoute,
  unlikeSeriesRoute,
  checkLikeRoute,
  purchaseChapterRoute,
  createCoinPurchaseOrderRoute,
  verifyPaymentRoute,
  getUserCoinPurchasesRoute,
  getCoinPurchaseRoute,
  createCommentRoute,
  getSeriesCommentsRoute,
  getChapterCommentsRoute,
  deleteCommentRoute,
  rateSeriesRoute,
  getUserRatingRoute,
  upcomingReleasesRoute,
  featuredSeriesRoute,
  risingStarsRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  validateResetTokenRoute,
} from "@/routes/server";
import {
  NewSeriesResponse,
  RecentlyReleasedChapterResponse,
  LatestUpdateResponse,
  LatestChapterResponse,
  LatestSeriesResponse,
  PopularSeriesResponse,
  AllSeriesListResponse,
  SeriesDetailsListResponse,
  ChapterReaderResponse,
  AuthResponse,
  RegisterResponse,
  LoginRequest,
  RegisterRequest,
  BookmarkResponse,
  BookmarkCheckResponse,
  PurchaseChapterResponse,
  CreateCoinPurchaseOrderRequest,
  CreateCoinPurchaseOrderResponse,
  VerifyPaymentResponse,
  CoinPurchaseResponse,
  LikeResponse,
  LikeCheckResponse,
  LastReadChapterResponse,
  SetLastReadChapterResponse,
  OngoingSeriesItem,
  UpcomingReleaseResponse,
  FeaturedSeriesResponse,
  RisingStarResponse,
} from "./types";
import { User } from "@/utils/auth";

interface ApiError {
  message: string;
  statusCode?: number;
}

export type ApiResponse<T, E = ApiError> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: E;
    };

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  private requestClient: AxiosInstance;

  constructor() {
    this.requestClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      withCredentials: true, // Include cookies in all requests
    });
  }

  /**
   * Make a request to the backend server.
   *
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param data - Request data (for POST/PUT requests)
   * @param params - Query parameters
   * @param headers - request headers
   * @returns Promise resolving to API response
   */
  private async execute<T = any>(requestData: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    endpoint: string;
    data?: any;
    params?: Record<string, any>;
    headers?: AxiosRequestConfig["headers"];
  }): Promise<ApiResponse<T>> {
    const { endpoint, method, data, params, headers } = requestData;
    const url = `/${endpoint.replace(/^\//, "")}`;

    try {
      // If data is FormData, don't set Content-Type header (let browser set it with boundary)
      const requestHeaders = { ...headers };
      if (data instanceof FormData) {
        delete (requestHeaders as any)?.["Content-Type"];
      }

      const response: AxiosResponse<any> = await this.requestClient.request({
        method,
        url,
        data,
        params,
        headers: requestHeaders,
        withCredentials: true,
      });

      // Backend wraps responses in { success: true, data: ... } format
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        } as ApiResponse<T>;
      } else {
        return {
          success: false,
          error: response.data.error || {
            message: "Unknown error occurred",
            statusCode: response.status,
          },
        } as ApiResponse<T>;
      }
    } catch (err) {
      console.error(
        `An error occurred when making request to the server.`,
        err
      );

      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        const errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          err.message ||
          "Unable to complete request call.";

        return {
          success: false,
          error: {
            statusCode: err.response?.status || err.status || 0,
            message: errorMessage,
          },
        };
      }

      return {
        success: false,
        error: {
          statusCode: 0,
          message:
            err instanceof Error
              ? err.message
              : "Unable to complete request call.",
        },
      };
    }
  }

  async getNewSeries() {
    return this.execute<Array<NewSeriesResponse>>({
      method: "GET",
      endpoint: newSeriesRoute,
    });
  }

  async getLatestUpdates() {
    return this.execute<Array<LatestUpdateResponse>>({
      method: "GET",
      endpoint: latestUpdatesRoute,
    });
  }

  async getRecentlyReleasedChapters() {
    return this.execute<Array<RecentlyReleasedChapterResponse>>({
      method: "GET",
      endpoint: recentlyReleasedChaptersRoute,
    });
  }

  /**
   * Get latest chapters
   * @param limit - Optional limit for number of chapters (defaults to 10)
   */
  async getLatestChapters(limit?: number) {
    const params = limit ? { limit: limit.toString() } : undefined;
    return this.execute<Array<LatestChapterResponse>>({
      method: "GET",
      endpoint: latestChaptersRoute,
      params,
    });
  }

  /**
   * Get latest series with recent chapters
   * @param limit - Optional limit for number of series (defaults to 12)
   */
  async getLatestSeries(limit?: number) {
    const params = limit ? { limit: limit.toString() } : undefined;
    return this.execute<Array<LatestSeriesResponse>>({
      method: "GET",
      endpoint: latestSeriesRoute,
      params,
    });
  }

  /**
   * Get popular series today (most reads in last 24 hours)
   * @param limit - Optional limit for number of series (defaults to 6)
   */
  async getPopularTodaySeries(limit?: number) {
    const params = limit ? { limit: limit.toString() } : undefined;
    return this.execute<Array<PopularSeriesResponse>>({
      method: "GET",
      endpoint: popularTodaySeriesRoute,
      params,
    });
  }

  /**
   * Get most popular series (all-time)
   * @param limit - Optional limit for number of series (defaults to 9)
   */
  async getMostPopularSeries(limit?: number) {
    const params = limit ? { limit: limit.toString() } : undefined;
    return this.execute<Array<PopularSeriesResponse>>({
      method: "GET",
      endpoint: mostPopularSeriesRoute,
      params,
    });
  }

  /**
   * Get all series with pagination and filters
   * @param page - Page number (defaults to 1)
   * @param limit - Items per page (defaults to 24)
   * @param filters - Filter options
   */
  async getAllSeries(
    page?: number,
    limit?: number,
    filters?: {
      status?: string[];
      novelType?: string[];
      categories?: string[];
      search?: string;
      sort?: string;
      chapters?: string;
    }
  ) {
    const params: Record<string, string> = {};
    if (page) params.page = page.toString();
    if (limit) params.limit = limit.toString();
    if (filters?.status && filters.status.length > 0) {
      params.status = filters.status.join(",");
    }
    if (filters?.novelType && filters.novelType.length > 0) {
      params.novelType = filters.novelType.join(",");
    }
    if (filters?.categories && filters.categories.length > 0) {
      params.categories = filters.categories.join(",");
    }
    if (filters?.search) {
      params.search = filters.search;
    }
    if (filters?.sort) {
      params.sort = filters.sort;
    }
    if (filters?.chapters) {
      params.chapters = filters.chapters;
    }

    return this.execute<AllSeriesListResponse>({
      method: "GET",
      endpoint: allSeriesRoute,
      params: Object.keys(params).length > 0 ? params : undefined,
    });
  }

  /**
   * Get all categories
   */
  async getCategories() {
    return this.execute<Array<string>>({
      method: "GET",
      endpoint: categoriesRoute,
    });
  }

  /**
   * Get series details by slug with paginated chapters
   * @param slug - Series slug
   * @param page - Page number (defaults to 1)
   * @param limit - Items per page (defaults to 20)
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async getSeriesDetails(
    slug: string,
    page?: number,
    limit?: number,
    cookieHeader?: string
  ) {
    const params: Record<string, string> = {};
    if (page) params.page = page.toString();
    if (limit) params.limit = limit.toString();

    return this.execute<SeriesDetailsListResponse>({
      method: "GET",
      endpoint: seriesDetailsRoute(slug),
      params: Object.keys(params).length > 0 ? params : undefined,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Execute request and return response with headers (for server actions)
   * @private
   */
  private async executeWithHeaders<T = any>(requestData: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    endpoint: string;
    data?: any;
    params?: Record<string, any>;
    headers?: AxiosRequestConfig["headers"];
  }): Promise<{ response: ApiResponse<T>; headers: Record<string, string> }> {
    const { endpoint, method, data, params, headers } = requestData;
    const url = `/${endpoint.replace(/^\//, "")}`;

    try {
      // If data is FormData, don't set Content-Type header (let browser set it with boundary)
      const requestHeaders = { ...headers };
      if (data instanceof FormData) {
        delete (requestHeaders as any)?.["Content-Type"];
      }

      const axiosResponse: AxiosResponse<any> =
        await this.requestClient.request({
          method,
          url,
          data,
          params,
          headers: requestHeaders,
          withCredentials: true,
        });

      // Convert axios headers to plain object
      const responseHeaders: Record<string, string> = {};
      Object.keys(axiosResponse.headers).forEach((key) => {
        const value = axiosResponse.headers[key];
        if (typeof value === "string") {
          responseHeaders[key] = value;
        } else if (Array.isArray(value) && value.length > 0) {
          responseHeaders[key] = value.join(", ");
        }
      });

      // Backend wraps responses in { success: true, data: ... } format
      if (axiosResponse.data.success) {
        return {
          response: {
            success: true,
            data: axiosResponse.data.data,
          } as ApiResponse<T>,
          headers: responseHeaders,
        };
      } else {
        return {
          response: {
            success: false,
            error: axiosResponse.data.error || {
              message: "Unknown error occurred",
              statusCode: axiosResponse.status,
            },
          } as ApiResponse<T>,
          headers: responseHeaders,
        };
      }
    } catch (err) {
      console.error(
        `An error occurred when making request to the server.`,
        err
      );

      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        const errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          err.message ||
          "Unable to complete request call.";

        const headers: Record<string, string> = {};
        if (err.response?.headers) {
          Object.keys(err.response.headers).forEach((key) => {
            const value = err.response?.headers[key];
            if (typeof value === "string") {
              headers[key] = value;
            } else if (Array.isArray(value) && value.length > 0) {
              headers[key] = value.join(", ");
            }
          });
        }

        return {
          response: {
            success: false,
            error: {
              message: errorMessage,
              statusCode: err.response?.status,
            },
          } as ApiResponse<T>,
          headers,
        };
      }

      return {
        response: {
          success: false,
          error: {
            message: "Network error occurred",
            statusCode: 0,
          },
        } as ApiResponse<T>,
        headers: {},
      };
    }
  }

  /**
   * Login as reader
   * @param credentials - Login credentials (email and password)
   */
  async login(credentials: LoginRequest) {
    return this.execute<AuthResponse>({
      method: "POST",
      endpoint: readerLoginRoute,
      data: credentials,
    });
  }

  /**
   * Login as reader (with headers for server actions)
   * @param credentials - Login credentials (email and password)
   */
  async loginWithHeaders(credentials: LoginRequest) {
    return this.executeWithHeaders<AuthResponse>({
      method: "POST",
      endpoint: readerLoginRoute,
      data: credentials,
    });
  }

  /**
   * Register as reader
   * @param userData - Registration data (username, email, password)
   */
  async register(userData: RegisterRequest) {
    return this.execute<RegisterResponse>({
      method: "POST",
      endpoint: readerRegisterRoute,
      data: userData,
    });
  }

  /**
   * Register as reader (with headers for server actions)
   * @param userData - Registration data (username, email, password)
   */
  async registerWithHeaders(userData: RegisterRequest) {
    return this.executeWithHeaders<RegisterResponse>({
      method: "POST",
      endpoint: readerRegisterRoute,
      data: userData,
    });
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    return this.execute<User>({
      method: "GET",
      endpoint: getCurrentUserRoute,
    });
  }

  /**
   * Logout current user
   */
  async logout() {
    return this.execute<{ message: string }>({
      method: "POST",
      endpoint: logoutRoute,
    });
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string) {
    return this.execute<{ message: string }>({
      method: "POST",
      endpoint: forgotPasswordRoute,
      data: { email },
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    return this.execute<{ message: string }>({
      method: "POST",
      endpoint: resetPasswordRoute,
      data: { token, newPassword },
    });
  }

  /**
   * Validate reset token
   */
  async validateResetToken(token: string) {
    return this.execute<{ valid: boolean; message?: string }>({
      method: "GET",
      endpoint: `${validateResetTokenRoute}?token=${encodeURIComponent(token)}`,
    });
  }

  /**
   * Bookmark a series
   * @param seriesId - Series ID to bookmark
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async bookmarkSeries(seriesId: string, cookieHeader?: string) {
    return this.execute<BookmarkResponse>({
      method: "POST",
      endpoint: bookmarkSeriesRoute(seriesId),
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Remove bookmark from a series
   * @param seriesId - Series ID to remove bookmark from
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async removeBookmark(seriesId: string, cookieHeader?: string) {
    return this.execute<{ message: string }>({
      method: "DELETE",
      endpoint: removeBookmarkRoute(seriesId),
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get chapter by series slug and chapter number
   * @param slug - Series slug
   * @param chapterNumber - Chapter number
   */
  async getChapterBySlug(
    slug: string,
    chapterNumber: number,
    cookieHeader?: string
  ) {
    return this.execute<ChapterReaderResponse>({
      method: "GET",
      endpoint: chapterReaderRoute(slug, chapterNumber),
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Check if a series is bookmarked
   * @param seriesId - Series ID to check
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async checkBookmark(seriesId: string, cookieHeader?: string) {
    return this.execute<BookmarkCheckResponse>({
      method: "GET",
      endpoint: checkBookmarkRoute(seriesId),
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get all bookmarked series for current user
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async getUserBookmarks(cookieHeader?: string) {
    return this.execute<BookmarkResponse[]>({
      method: "GET",
      endpoint: getUserBookmarksRoute,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get last read chapter number for a series
   * @param seriesId - Series ID
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async getLastReadChapter(seriesId: string, cookieHeader?: string) {
    return this.execute<LastReadChapterResponse>({
      method: "GET",
      endpoint: getLastReadChapterRoute(seriesId),
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Set last read chapter number for a series
   * @param seriesId - Series ID
   * @param chapterNumber - Chapter number
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async setLastReadChapter(
    seriesId: string,
    chapterNumber: number,
    cookieHeader?: string
  ) {
    return this.execute<SetLastReadChapterResponse>({
      method: "PUT",
      endpoint: setLastReadChapterRoute(seriesId),
      data: { chapterNumber },
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get ongoing series (reader has read at least 3 chapters)
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async getOngoingSeries(cookieHeader?: string) {
    return this.execute<OngoingSeriesItem[]>({
      method: "GET",
      endpoint: getOngoingSeriesRoute,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Like a series
   * @param seriesId - Series ID to like
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async likeSeries(seriesId: string, cookieHeader?: string) {
    return this.execute<LikeResponse>({
      method: "POST",
      endpoint: likeSeriesRoute(seriesId),
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Unlike a series
   * @param seriesId - Series ID to unlike
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async unlikeSeries(seriesId: string, cookieHeader?: string) {
    return this.execute<{ message: string }>({
      method: "DELETE",
      endpoint: unlikeSeriesRoute(seriesId),
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Check if a series is liked
   * @param seriesId - Series ID to check
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async checkLike(seriesId: string, cookieHeader?: string) {
    return this.execute<LikeCheckResponse>({
      method: "GET",
      endpoint: checkLikeRoute(seriesId),
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Purchase a chapter
   * @param chapterId - Chapter ID to purchase
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async purchaseChapter(chapterId: string, cookieHeader?: string) {
    return this.execute<PurchaseChapterResponse>({
      method: "POST",
      endpoint: purchaseChapterRoute(chapterId),
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Create a coin purchase order
   * @param data - Coin purchase order data
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async createCoinPurchaseOrder(
    data: CreateCoinPurchaseOrderRequest,
    cookieHeader?: string
  ) {
    return this.execute<CreateCoinPurchaseOrderResponse>({
      method: "POST",
      endpoint: createCoinPurchaseOrderRoute,
      data,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Verify a payment
   * @param orderId - PayPal order ID
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async verifyPayment(orderId: string, cookieHeader?: string) {
    return this.execute<VerifyPaymentResponse>({
      method: "POST",
      endpoint: verifyPaymentRoute,
      data: { orderId },
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get user's coin purchase history
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async getUserCoinPurchases(cookieHeader?: string) {
    return this.execute<CoinPurchaseResponse[]>({
      method: "GET",
      endpoint: getUserCoinPurchasesRoute,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get a specific coin purchase by ID
   * @param purchaseId - Purchase ID
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async getCoinPurchase(purchaseId: string, cookieHeader?: string) {
    return this.execute<CoinPurchaseResponse>({
      method: "GET",
      endpoint: getCoinPurchaseRoute(purchaseId),
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Create a comment
   * @param data - Comment data
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async createComment(
    data: {
      content: string;
      seriesId?: string;
      chapterId?: string;
      parentCommentId?: string;
    },
    cookieHeader?: string
  ) {
    return this.execute<any>({
      method: "POST",
      endpoint: createCommentRoute,
      data,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get comments for a series
   * @param seriesId - Series ID
   */
  async getSeriesComments(seriesId: string) {
    return this.execute<any[]>({
      method: "GET",
      endpoint: getSeriesCommentsRoute(seriesId),
    });
  }

  /**
   * Get comments for a chapter
   * @param chapterId - Chapter ID
   */
  async getChapterComments(chapterId: string) {
    return this.execute<any[]>({
      method: "GET",
      endpoint: getChapterCommentsRoute(chapterId),
    });
  }

  /**
   * Delete a comment
   * @param commentId - Comment ID
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async deleteComment(commentId: string, cookieHeader?: string) {
    return this.execute<any>({
      method: "DELETE",
      endpoint: deleteCommentRoute(commentId),
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Rate a series
   * @param seriesId - Series ID
   * @param rating - Rating value (1-5)
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async rateSeries(seriesId: string, rating: number, cookieHeader?: string) {
    return this.execute<{ message: string; rating: any }>({
      method: "POST",
      endpoint: rateSeriesRoute(seriesId),
      data: { rating },
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get user's rating for a series
   * @param seriesId - Series ID
   * @param cookieHeader - Optional cookie header string for server-side requests
   */
  async getUserRating(seriesId: string, cookieHeader?: string) {
    return this.execute<{ rating: number | null }>({
      method: "GET",
      endpoint: getUserRatingRoute(seriesId),
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  }

  /**
   * Get active announcements for the public site
   */
  async getFeaturedSeries() {
    return this.execute<Array<FeaturedSeriesResponse>>({
      method: "GET",
      endpoint: featuredSeriesRoute,
    });
  }

  async getRisingStars() {
    return this.execute<Array<RisingStarResponse>>({
      method: "GET",
      endpoint: risingStarsRoute,
    });
  }

  async getUpcomingReleases() {
    return this.execute<Array<UpcomingReleaseResponse>>({
      method: "GET",
      endpoint: upcomingReleasesRoute,
    });
  }

  async getActiveAnnouncements() {
    return this.execute<
      Array<{
        id: string;
        title: string;
        content: string;
        type: "info" | "warning" | "success" | "error";
        startDate: string;
        endDate: string | null;
      }>
    >({
      method: "GET",
      endpoint: "/announcement/public/active",
    });
  }
}

const apiClientManager = new ApiClient();
export default apiClientManager;
