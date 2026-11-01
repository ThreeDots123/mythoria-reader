# Mythoria — New Revenue Features (Planning + API Contract)

> Planning document only. No code is to be written from this document until explicitly requested.

## Context

Today the platform earns money one way: readers buy coin packs (PayPal or NOWPayments crypto) and spend coins to unlock premium chapters one at a time. There are no subscriptions, ads, referrals, tipping, promo codes or bulk unlocks. The client is a Next.js 16 app-router frontend; the backend is a separate repo, so every feature below has two halves: client work here, and an API contract the backend team implements.

Five features were selected for planning:

1. Membership subscription ("Mythoria Plus")
2. Display ads for free readers
3. Referral program
4. Sponsor / tip a chapter
5. Daily check-in coins (rewarded video ads deferred)

Considered but not planned now: bulk unlock discounts, coin sales / first-purchase bonus, promo codes, gifting, EPUB volume sales, affiliate links, creator/author platform.

## Verified facts about the codebase that shape the plan

| Area | Finding |
|---|---|
| Lock mechanic | `src/components/pages/series/novel-details/chapter/index.tsx:342` — `isPremiumLocked = chapter.isPremium && !chapter.content`. Server omits `content` for locked chapters. |
| Existing bug | Reader passes `onPurchaseSuccess={() => {}}` (~line 669) and `fetchChapter` is closed inside a `useEffect`, so an unlocked chapter stays locked until page reload. Fix in Phase 0. |
| Chapter price stated 3 ways | `purchase-coins/index.tsx:39` `COINS_PER_CHAPTER = 15`; FAQ line ~110 says 20; `inline-purchase-modal.tsx:30` packs imply 20; reader falls back to `\|\| 20`. Coin packs are duplicated in two files. |
| User type | `src/utils/auth.ts` `User {id, username, email, role, coinBalance?}`. `role` is never branched on. `refreshUser()` in `src/contexts/auth-context.tsx` is the established way to refresh balance after mutations. |
| API pattern | `src/routes/server.ts` (endpoint constants) → `src/api/interface.ts` (axios singleton, unwraps `{success,data}`) → `src/server-actions/<x>.ts` (each copies a `getCookieHeader()` helper) → `src/api/types.ts`. Error shape `{statusCode, message}`; inline modal string-matches `"insufficient"`. |
| Content rendering | `chapter/global/magic-tags/renderer.tsx` splits content on `\n` (~line 252) and maps lines to nodes (~line 912) — the natural mid-content ad injection point. |
| Register | `accounts/register/index.tsx` already uses `useSearchParams()` and calls `registerAction({username,email,password})`. |
| Env | Only `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_MAINTENANCE_MODE`. No `src/config/` directory. |
| Layouts | `/account/*` is the auth layout; membership pages should not live under it. |
| SEO / ads risk | Series and chapter pages are `"use client"` with `useEffect` fetches and no `generateMetadata`; the AdSense crawler sees empty shells. |
| Reusable pieces | `src/components/shared/inline-purchase-modal.tsx`, `coin-value-badge.tsx`, `content-dialog-drawer.tsx`, the unused `engagement-hook-card.tsx` and `social-proof-bar.tsx`, the `SheetStep` crypto flow in `purchase-coins/index.tsx:212-400`. |

---

## Phase 0 — Prerequisites (S) — required by every feature

1. **`src/config/pricing.ts`** (new, single source of truth): `COIN_TO_USD = 0.05`, `DEFAULT_CHAPTER_PRICE_COINS = 20` (marketing math only; real price is `chapter.priceInCoins`), `COIN_PACKS[]`, `chaptersForCoins()`, `MEMBERSHIP_PLANS_FALLBACK`, `TIP_PRESETS = [25, 50, 100, 250]`. Migrate `purchase-coins/index.tsx:39-70`, `inline-purchase-modal.tsx:30-35`, `coin-value-badge.tsx:6`, and the reader `|| 20` fallbacks. Confirm with backend what `priceInCoins` defaults to.
2. **`src/config/features.ts`** (new): reads `NEXT_PUBLIC_FEATURE_{MEMBERSHIP,ADS,REFERRAL,SPONSOR,CHECKIN}` plus ad config vars. Components early-return when a flag is off.
3. **Extend `User`** in `src/utils/auth.ts` (returned by `GET /account/me`):
   ```ts
   type MembershipStatus = "none" | "active" | "cancelled" | "past_due" | "expired";
   interface Membership {
     status: MembershipStatus;
     plan: "plus_monthly" | "plus_yearly" | null;
     provider: "paypal" | "crypto" | null;
     currentPeriodEnd: string | null;   // perks valid until this, even when cancelled
     cancelAtPeriodEnd: boolean;
     coinsPerPeriod: number;
     nextCoinGrantAt: string | null;
   }
   interface User {
     id; username; email; role; coinBalance?;
     membership?: Membership;            // absent === none
     referralCode?: string;
     checkIn?: { streak: number; canCheckIn: boolean; nextCheckInAt: string | null };
     createdAt?: string;
   }
   ```
   `auth-context.tsx` needs no change; call `refreshUser()` after any wallet or membership mutation.
4. **`src/hooks/use-membership.ts`** (new): `useMembership()` → `{ isMember, plan, renewsAt, cancelAtPeriodEnd, status, adFree, isLoading }`. `isMember = status ∈ {active, cancelled, past_due} && currentPeriodEnd > now`. `adFree = isMember || role ∈ {admin, translator}`. Dev-only override via `localStorage.mythoria_debug_membership = "active" | "none"`.
5. **Small cleanups**: shared `src/server-actions/_cookies.ts` `getCookieHeader()`; add `code?: string` to the `ApiResponse` error passthrough in `src/api/interface.ts`; fix the reader refetch (hoist `fetchChapter` into `useCallback`, pass it as `onPurchaseSuccess`); `src/lib/analytics.ts` `trackEvent()` wrapping `@vercel/analytics` `track`; add `plus`, `plusManage`, `plusSuccess`, `plusCancel`, `referral` to `src/routes/client.ts`; extract `CoinPackPicker` from `inline-purchase-modal.tsx` into `src/components/shared/coin-pack-picker.tsx`.

---

## Feature 1 — Mythoria Plus (membership) — L, highest direct revenue

### Recommended model: coin allowance + ad-free + badge (NOT all-access)

- All-access would cannibalise per-chapter coin revenue (the only proven line), require entitlement checks on every chapter fetch with lapse/revocation edge cases, and invite account sharing.
- **Plus Monthly $9.99 → 250 coins/month** (vs 200 for $10 à la carte) + ad-free + member badge + optional 10% off unlocks (backend-computed; `memberPriceInCoins?` on chapter if shipped). **Plus Yearly $99** → 250 coins granted monthly (limits refund exposure). Coins never expire.
- **`isPremiumLocked` does not change.** Membership only affects coin balance (grants), displayed price, upsell copy on the lock card, and ads. This keeps the reader contract stable. `plan` is a string union so a future "Plus Unlimited" tier can be added; `ChapterReaderResponse.chapter` may later carry `unlockedVia`.

### Client files

| Action | Path |
|---|---|
| Add | `src/app/(site)/plus/page.tsx`, `plus/success/page.tsx` (Suspense-wrapped like purchase/success), `plus/cancel/page.tsx`, `plus/manage/page.tsx` |
| Add | `src/components/pages/plus/index.tsx` (hero, monthly/yearly toggle, perks, comparison vs packs, FAQ, CTA); `plus/checkout-sheet.tsx` (PayPal / crypto picker; extract the crypto currency picker + quote loader from `purchase-coins/index.tsx:212-400` into `src/components/shared/crypto-checkout-steps.tsx` and reuse in both); `plus/success/index.tsx` (confirms `subscription_id`); `plus/manage/index.tsx` (status card, renewal, grants, invoices, cancel dialog via `content-dialog-drawer`, "Renew" for crypto prepaid) |
| Add | `src/components/shared/member-badge.tsx`; `src/components/shared/plus-upsell-card.tsx` (used in lock card, inline modal, purchase page, `/reading` header) |
| Add | `src/server-actions/membership.ts`; constants in `routes/server.ts`; methods in `api/interface.ts`; types in `api/types.ts` |
| Modify | `navigation/index.tsx` (badge next to coin pill ~line 87 / 185-223; drawer link) · `chapter/index.tsx` lock card (~638-673: upsell for non-members) · `inline-purchase-modal.tsx` (Plus row) · `purchase-coins/index.tsx` (FAQ "No subscription" copy ~line 408; Plus banner above packs) · `footer/index.tsx` |

### API contract

All responses are `{success, data}` or `{success: false, error: {code, message, statusCode}}`.

| Method | Path | Auth | Request | Response `data` | Errors |
|---|---|---|---|---|---|
| GET | `/membership/plans` | public | — | `[{ id, name, interval: "month"\|"year", priceUsd, coinsPerPeriod, perks[], providers[], paypalPlanId }]` | — |
| GET | `/membership/me` | cookie | — | `Membership & { startedAt, coinsGrantedThisPeriod, grants[{at, coins}], invoices[{id, at, amountUsd, provider, status, periodStart, periodEnd}] }` | 401 |
| POST | `/membership/subscribe` | cookie | `{ planId, provider: "paypal" }` | `{ subscriptionId, approvalUrl }` | 409 `ALREADY_SUBSCRIBED`, 404 `PLAN_NOT_FOUND` |
| POST | `/membership/subscribe` | cookie | `{ planId, provider: "crypto", currency, months: 1\|12 }` | `{ paymentId, invoiceUrl, payAddress, payAmount, payCurrency, expiresAt }` | 400 `MIN_AMOUNT`, 409 |
| POST | `/membership/paypal/confirm` | cookie | `{ subscriptionId }` | `Membership` (idempotent; activates, grants first coins) | 402 `NOT_APPROVED`, 404 |
| POST | `/membership/cancel` | cookie | `{ reason? }` | `Membership` with `cancelAtPeriodEnd: true` | 409 `NOT_ACTIVE` |
| GET | `/membership/crypto/status/:paymentId` | cookie | — | `{ status: waiting\|confirming\|finished\|failed\|expired, membership? }` | 404 |

PayPal return URL: `{BASE}/plus/success?subscription_id=I-XXX&ba_token=…&token=…`; cancel URL `{BASE}/plus/cancel`.

**Backend webhooks (idempotent on event id):**

- `BILLING.SUBSCRIPTION.ACTIVATED` → activate
- `PAYMENT.SALE.COMPLETED` (with `billing_agreement_id`) → extend `currentPeriodEnd`, grant coins, write invoice
- `BILLING.SUBSCRIPTION.PAYMENT.FAILED` → `past_due` (3-day grace)
- `BILLING.SUBSCRIPTION.SUSPENDED / CANCELLED / EXPIRED` → `cancelled` / `expired`
- `PAYMENT.SALE.REFUNDED / REVERSED` → revoke period, claw back ungranted coins
- NOWPayments IPN `finished` → activate/extend for `months`
- `/account/me` must embed the `membership` summary

---

## Feature 2 — Display ads for free readers — M, traffic-bound

### Design

- **AdSense, manual fixed-size slots only** (no Auto ads) for CLS control. Load `adsbygoogle.js` via `next/script strategy="afterInteractive"` only when `features.ads && !adFree && consent !== "denied"`, and only from pages with slots (never in `(site)/layout.tsx`).
- **Consent:** Google certified CMP (Funding Choices) via `NEXT_PUBLIC_CMP_ID`; required for EEA/UK. The privacy policy needs an ads/cookies paragraph.
- **Placements:** chapter `top` (responsive leaderboard, `min-h-[100px] md:min-h-[90px]`), `mid` (in-article fluid `min-h-[280px]`, injected after ~50% of paragraphs, minimum 8 paragraphs before it, never inside a conversation block), `bottom` (300×250 after the article). Series page: one rectangle after `OverviewSection` (`novel-details/index.tsx` ~line 444). **Locked chapters render no slots** (keep the lock card a clean conversion surface).
- **Members:** `useMembership().adFree` short-circuits every slot to `null` and skips the script.
- **`ads.txt`:** static `public/ads.txt`.
- **CSR risk (flagged, not fixed here):** before applying to AdSense, move the initial series/chapter fetch to the server-component page wrappers and add `generateMetadata`; otherwise expect "low value content" rejections. Apply early; approval takes 2–4 weeks.

### Client files

| Action | Path |
|---|---|
| Add | `src/components/ads/ad-scripts.tsx` (CMP + adsbygoogle), `ads/ad-slot.tsx` (`placement` prop, size map, `useEffect` push, `data-adtest="on"` outside prod), `ads/use-ad-consent.ts`, `public/ads.txt` |
| Modify | `chapter/index.tsx` (mount scripts; top slot before article ~677; bottom after ~702; pass `interstitial` to `MagicRenderer` ~686) · `magic-tags/renderer.tsx` (new optional `interstitial?: { afterLine, node }` inserted in the line map) · `novel-details/index.tsx` (series slot) · privacy policy copy |
| Env | `NEXT_PUBLIC_FEATURE_ADS`, `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_{CHAPTER_TOP,CHAPTER_MID,CHAPTER_BOTTOM,SERIES}`, `NEXT_PUBLIC_CMP_ID` |

No backend endpoints needed.

---

## Feature 3 — Referral program — M, growth

### Design

- Backend generates `referralCode` (6–8 chars) and returns it in `/account/me`. Link format `{BASE}/r/{code}`; also honour `?ref=` on any page.
- **Capture:** `src/app/r/[code]/route.ts` sets cookie `mythoria_ref` (30 days, `SameSite=Lax`, not httpOnly so the client can read it after OAuth) and 302s to `/account/register?ref={code}`. A small `ReferralCapture` client component in `(site)/layout.tsx` writes the same cookie from `?ref=`.
- **Register:** read `ref` from the URL, fall back to the cookie, show "Invited by {username}" (validate endpoint), pass `referralCode` to `registerAction`. For Discord/Google signups, the client calls `POST /referral/claim` once after auth when the cookie exists and `user.createdAt` is under 7 days old.
- **Reward:** on the invitee's **first completed** coin purchase, the referrer gets a percentage (e.g. 10%, capped) and the invitee a flat bonus; amounts come from the API so UI copy never goes stale. Backend owns anti-abuse (self-referral, same IP/device, refund clawback).

### Client files

| Action | Path |
|---|---|
| Add | `src/app/r/[code]/route.ts`; `src/app/(site)/referral/page.tsx`; `src/components/pages/referral/index.tsx` (link card with copy + `navigator.share` + Discord/X intents, 3 stat tiles, rewards explainer, recent list, empty state); `referral/referral-capture.tsx`; `src/server-actions/referral.ts`; routes/interface/types |
| Modify | `accounts/register/index.tsx` (banner, pass code) · `server-actions/auth.ts registerAction` (accept `referralCode`, read cookie via `next/headers`) · `RegisterRequest` type · `navigation/index.tsx` ("Invite friends") · `purchase-coins/success/index.tsx` (toast if `referralBonus`) · optionally replace the fake stats in `home/community-stats.tsx` with an invite CTA |

### API contract

| Method | Path | Auth | Request | Response `data` | Errors |
|---|---|---|---|---|---|
| GET | `/referral/me` | cookie | — | `{ code, link, rewards: { inviteeBonusCoins, referrerPercent, referrerMaxCoins }, stats: { invited, converted, coinsEarned }, recent: [{ username (masked), status: pending\|converted, joinedAt, convertedAt, coinsAwarded }] }` | 401 |
| GET | `/referral/validate/:code` | public | — | `{ valid, referrerUsername?, inviteeBonusCoins }` | — |
| POST | `/referral/claim` | cookie | `{ code }` | `{ claimed: true, referrerUsername }` | 400 `SELF_REFERRAL`, 409 `ALREADY_REFERRED`, 410 `ACCOUNT_TOO_OLD`, 404 `INVALID_CODE` |
| POST | `/account/reader/register` (existing) | public | `+ referralCode?` | `+ referralApplied: boolean` (invalid code ignored silently) | — |
| POST | `/payment/coins/verify` (existing) | cookie | unchanged | `+ referralBonus?: { inviteeCoins, referrerCoins }` | — |

---

## Feature 4 — Tip jar + sponsor-next-chapter — M, community

### Design

- **Tip jar:** coins from the wallet to a series (translator). Presets from `TIP_PRESETS`, custom amount, optional message (≤140 chars), anonymous flag. Insufficient balance → inline `CoinPackPicker` step.
- **Sponsor goal:** at most one `open` goal per series, created by staff with a target and a linked next chapter. Readers contribute coins; when `pooledCoins >= targetCoins` the backend publishes that chapter early and updates `upcomingRelease` (`nextReleaseAt` moved up, `isEstimate = false`, new `sponsored: true`). If the chapter is not released within `refundAfterHours` the backend refunds contributors. Otherwise contributions are non-refundable (state this clearly in the UI).
- **Surfaces:** `SponsorGoalCard` (progress bar, X/Y coins, contributor count, top 5, CTA) under `UpcomingReleaseBanner` on the series page (~line 425) and at the end of the latest chapter when `!nextChapter` (reader ~line 775). Tip button in `cover-and-actions.tsx` beside bookmark/like. Dialogs via `content-dialog-drawer.tsx`; amounts via `coin-value-badge.tsx`; `engagement-hook-card.tsx` as the styling pattern for the end-of-chapter card.

### Client files

| Action | Path |
|---|---|
| Add | `src/components/pages/series/novel-details/tip-dialog.tsx`, `sponsor-goal-card.tsx`, `sponsor-contribute-dialog.tsx`; `src/server-actions/support.ts`; routes/interface/types |
| Modify | `cover-and-actions.tsx` (`onTip` prop + button) · `novel-details/index.tsx` (fetch goal, render card) · `chapter/index.tsx` (end-of-latest-chapter card) · `types.ts SeriesUpcomingRelease` (+ `sponsored?`) |

### API contract

| Method | Path | Auth | Request | Response `data` | Errors |
|---|---|---|---|---|---|
| POST | `/tip/series/:seriesId` | cookie | `{ coins, message?, anonymous? }` | `{ tipId, remainingBalance }` | 402 `INSUFFICIENT_BALANCE`, 400 `MIN_TIP`, 429 |
| GET | `/tip/series/:seriesId/summary` | public | — | `{ totalCoins, supportersCount, recent[{ username\|"Anonymous", coins, message, at }], topSupporters[{ username, coins }] }` | — |
| GET | `/sponsor/series/:seriesId/current` | public (cookie optional) | — | `{ goal: null \| { id, targetCoins, pooledCoins, contributorsCount, targetChapterNumber, status: open\|reached\|released\|refunded, endsAt, releasedAt }, topContributors[], myContribution }` | — |
| POST | `/sponsor/goals/:goalId/contribute` | cookie | `{ coins, anonymous? }` | `{ goal, remainingBalance, reached, coinsApplied }` (backend caps to remaining) | 402 `INSUFFICIENT_BALANCE`, 409 `GOAL_CLOSED` |

---

## Feature 5 — Daily check-in — S, retention (rewarded ads deferred)

### Design

- Server-authoritative UTC calendar-day check-in with a 7-day streak cycle: days 1–6 → 1, 1, 2, 2, 3, 3 coins, day 7 → 5 (≈2.4 coins/day, ≈$0.12 nominal, zero marginal cost). A missed day resets the cycle. The schedule comes from the API so it can be tuned without a deploy.
- **UI:** dot on the nav coin pill when `user.checkIn.canCheckIn`; clicking opens `CheckInSheet` (`content-dialog-drawer`) with a 7-day strip, today's reward and streak. Also embedded on `/purchase` under the balance pill (~line 412) and at the top of `/reading`. On success: `refreshUser()`, toast, light framer-motion celebration.
- **Rewarded video: defer.** AdSense has no rewarded web format; options are Google Ad Manager "Rewarded web" (needs a GAM account plus server-side verification) or Adsterra/Monetag. Reserve `POST /rewards/ad/complete` for a verified callback later.

### Client files

| Action | Path |
|---|---|
| Add | `src/components/shared/check-in-sheet.tsx`, `check-in-button.tsx`; `src/server-actions/rewards.ts`; routes/interface/types |
| Modify | `navigation/index.tsx` (coin pill ~185/206; drawer link) · `purchase-coins/index.tsx` · `reading/index.tsx` header |

### API contract

| Method | Path | Auth | Request | Response `data` | Errors |
|---|---|---|---|---|---|
| GET | `/rewards/check-in` | cookie | — | `{ canCheckIn, streak, dayInCycle: 1–7, todayReward, schedule[{ day, coins }], lastCheckInAt, nextCheckInAt }` | 401 |
| POST | `/rewards/check-in` | cookie | `{}` | `{ coinsAwarded, streak, dayInCycle, balance, nextCheckInAt }` | 409 `ALREADY_CHECKED_IN` (same payload, `coinsAwarded: 0`) |
| GET | `/account/me` (existing) | cookie | — | `+ checkIn: { streak, canCheckIn, nextCheckInAt }` | — |

---

## Cross-cutting

**Analytics events** (`src/lib/analytics.ts`, Vercel custom events): `plus_view`, `plus_checkout_start {plan, provider}`, `plus_activated {plan}`, `plus_cancel`, `ad_slot_fill {placement}`, `ad_consent {status}`, `referral_copy`, `referral_share {channel}`, `referral_claimed`, `tip_sent {coins}`, `sponsor_contribute {coins, reached}`, `checkin_complete {streak, coins}`, plus the existing-flow gaps `chapter_unlock_click` and `coin_pack_select {coins}`.

**Env additions** (document in a new `.env.example`): `NEXT_PUBLIC_FEATURE_{MEMBERSHIP,ADS,REFERRAL,SPONSOR,CHECKIN}`, `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_*`, `NEXT_PUBLIC_CMP_ID`.

**Backend-wide asks:** every error includes a stable `error.code`; `/account/me` embeds `membership`, `referralCode`, `checkIn`, `createdAt`; all money and webhook handlers are idempotent.

## Build order

| Phase | Scope | Effort | Revenue impact | Depends on |
|---|---|---|---|---|
| 0 | pricing/features config, User type, `useMembership`, analytics, error codes, reader refetch fix, `coin-pack-picker` extraction | S | indirect (fixes unlock bug) | — |
| 1 | Daily check-in | S | retention; builds the coin habit | 0 |
| 2 | Membership (plans page, PayPal, crypto, manage, badge, upsells) | L | highest direct | 0; backend PayPal plans + webhooks |
| 3 | Referral | M | growth; lifts pack purchases | 0; backend register/verify changes |
| 4 | Ads (CMP, slots, ads.txt) | M | moderate, traffic-bound | 0, 2 (ad-free perk); AdSense approval — start the application during phase 1 |
| 5 | Tip jar (S) + Sponsor goal (M) | M | small–moderate; community | 0; `upcomingRelease` backend work |

## Verification

- **Phase 0:** unlock a premium chapter; content appears without reload. `grep -rn "COINS_PER_CHAPTER\|coinPlans\|0.05" src` hits only `src/config/pricing.ts`.
- **Membership:** PayPal sandbox business account → backend creates product + plans → sandbox buyer approves → `/plus/success` shows active, nav badge, +250 coins. Webhook simulator: `PAYMENT.SALE.COMPLETED` grants coins once even when resent; `BILLING.SUBSCRIPTION.CANCELLED` → cancelled with perks until period end. Crypto: NOWPayments sandbox + manual IPN → "expires on", no auto-renew, Renew CTA. Cancel from `/plus/manage`. Fake state via `localStorage.mythoria_debug_membership = "active"` in dev to check ad-free, badge, upsell hiding.
- **Ads:** with `NEXT_PUBLIC_FEATURE_ADS=true` and `data-adtest="on"`: no script on `/purchase` or `/account/*`; three slots on a free chapter with Lighthouse CLS < 0.1; zero slots on locked chapters; zero slots and no script with debug membership; CMP prompt with EEA geolocation override; `/ads.txt` serves the publisher line.
- **Referral:** visit `/r/CODE` → cookie set, register page shows "Invited by"; register → referrer's `/referral/me` shows `invited: 1, pending`; invitee buys the Starter pack in sandbox → both balances rise, `converted: 1`; self-referral and a second claim return coded errors; the OAuth signup path claims via cookie.
- **Tip / sponsor:** tip with insufficient balance → pack picker appears; successful tip → balance drops, summary updates. Backend creates a goal → progress bar on the series page and at the end of the latest chapter; contribute until reached → `status: reached`, `upcomingRelease` shows sponsored; over-contribution is capped.
- **Check-in:** first check-in → +1 coin, streak 1, button disabled with countdown; a second POST the same day → 409 handled silently; advance the server clock 7 days → day-7 reward 5; a skipped day resets the streak.
