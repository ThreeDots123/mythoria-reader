"use server";

import apiClientManager from "@/api/interface";

export async function getLatestUpdatesAction() {
  const response = await apiClientManager.getLatestUpdates();

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

export async function getRecentlyReleasedChaptersAction() {
  const response = await apiClientManager.getRecentlyReleasedChapters();

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

export async function getLatestChaptersAction(limit?: number) {
  const response = await apiClientManager.getLatestChapters(limit);

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

export async function getLatestSeriesAction(limit?: number) {
  const response = await apiClientManager.getLatestSeries(limit);

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

export async function getPopularTodaySeriesAction(limit?: number) {
  const response = await apiClientManager.getPopularTodaySeries(limit);

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

export async function getMostPopularSeriesAction(limit?: number) {
  const response = await apiClientManager.getMostPopularSeries(limit);

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

export async function getUpcomingReleasesAction() {
  const response = await apiClientManager.getUpcomingReleases();

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
