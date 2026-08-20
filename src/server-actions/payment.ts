"use server";

import { cookies } from "next/headers";
import apiClientManager from "@/api/interface";
import {
  CreateCoinPurchaseOrderRequest,
  CreateCoinPurchaseOrderResponse,
  VerifyPaymentResponse,
  CoinPurchaseResponse,
} from "@/api/types";

/**
 * Helper to get all cookies from the request and format them into a single string
 * to be forwarded as a 'Cookie' header.
 */
async function getCookieHeader(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookieEntries = cookieStore.getAll();
  if (cookieEntries.length === 0) {
    return undefined;
  }
  return cookieEntries.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

export async function createCoinPurchaseOrderAction(
  data: CreateCoinPurchaseOrderRequest,
) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.createCoinPurchaseOrder(
    data,
    cookieHeader,
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

export async function verifyPaymentAction(orderId: string) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.verifyPayment(orderId, cookieHeader);

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

export async function getUserCoinPurchasesAction() {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.getUserCoinPurchases(cookieHeader);

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

export async function getCryptoCurrenciesAction() {
  const response = await apiClientManager.getCryptoCurrencies();

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

export async function getCryptoMinimumAmountAction(currency: string) {
  const response = await apiClientManager.getCryptoMinimumAmount(currency);

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

export async function getCryptoEstimateAction(
  currency: string,
  amount: number,
) {
  const response = await apiClientManager.getCryptoEstimate(currency, amount);

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

export async function getCoinPurchaseAction(purchaseId: string) {
  const cookieHeader = await getCookieHeader();
  const response = await apiClientManager.getCoinPurchase(
    purchaseId,
    cookieHeader,
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

