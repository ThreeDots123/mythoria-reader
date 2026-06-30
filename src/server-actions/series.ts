"use server";

import apiClientManager from "@/api/interface";
import { ChapterReaderResponse } from "@/api/types";
import { cookies } from "next/headers";

/**
 * Get cookie header string from Next.js cookies
 */
async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  const cookiePairs: string[] = [];

  cookieStore.getAll().forEach((cookie) => {
    cookiePairs.push(`${cookie.name}=${cookie.value}`);
  });

  return cookiePairs.join("; ");
}

export async function getNewSeriesAction() {
  const response = await apiClientManager.getNewSeries();

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function getFeaturedSeriesAction() {
  const response = await apiClientManager.getFeaturedSeries();

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function getRisingStarsAction() {
  const response = await apiClientManager.getRisingStars();

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function getAllSeriesAction(
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
  const response = await apiClientManager.getAllSeries(page, limit, filters);

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function getCategoriesAction() {
  const response = await apiClientManager.getCategories();

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function getSeriesDetailsAction(
  slug: string,
  page?: number,
  limit?: number
) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.getSeriesDetails(
    slug,
    page,
    limit,
    cookieHeader,
  );

  if (!response.success)
    return {
      success: false,
      error: response.error.message,
    } as const;

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function getChapterBySlugAction(
  slug: string,
  chapterNumber: number
) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.getChapterBySlug(
    slug,
    chapterNumber,
    cookieHeader
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function rateSeriesAction(seriesId: string, rating: number) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.rateSeries(
    seriesId,
    rating,
    cookieHeader
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}

export async function getUserRatingAction(seriesId: string) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.getUserRating(
    seriesId,
    cookieHeader
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    } as const;
  }

  return {
    success: true,
    data: response.data,
  } as const;
}
