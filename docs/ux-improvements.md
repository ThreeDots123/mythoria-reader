# Mythoria — Reading & Platform Experience Improvements

> Suggestions only. Nothing in this document has been implemented. File references point at the code as it stands on `feature/platform-redesign`.

## How to read this

Every item is tagged with **effort** (S / M / L) and **impact** (★ to ★★★). Section 1 is the short list to do first. Sections 2–9 go area by area. Section 10 is a suggested order.

---

## 1. The ten things to fix first

| # | Problem | Where | Effort | Impact |
|---|---|---|---|---|
| 1 | **Unlocking a chapter does nothing visible.** After paying coins the modal closes and the lock screen stays until a hard reload. | `chapter/index.tsx:670` passes `onPurchaseSuccess={() => {}}`; `fetchChapter` is trapped inside a `useEffect` (`:172-193`) | S | ★★★ |
| 2 | **Reader chrome collides with the site shell.** The site nav (`sticky top-0 z-50`, ~80px) sits on top of the reader's own header (`z-40`), the floating chapter bar is hidden behind it, and on mobile the bottom tab bar (`fixed z-50`) covers the prev/next bar (`z-30`). "Fullscreen" never hides any of it. | `chapter/index.tsx:363-407, 706-711`; `navigation/index.tsx:113-119, 259-261` | M | ★★★ |
| 3 | **Chapter list has no read / purchased / current markers.** A reader on chapter 300 cannot see where they are, even though last-read is already fetched on that page. | `chapters-section.tsx:85-135`; `novel-details/index.tsx:269`; `api/types.ts:136-143` | M (needs `isRead`, `isPurchased` from API) | ★★★ |
| 4 | **Signing up leaves you logged out in the UI.** Register never calls `setAuth`, so the header shows "Login" and 0 coins until reload. | `register/index.tsx:66-72` vs `login/index.tsx:62` | S | ★★★ |
| 5 | **Paginating the chapter list blanks the whole series page** with a differently shaped skeleton (layout shift every click). | `novel-details/index.tsx:233-260, 346`; `skeleton.tsx:8` | S | ★★ |
| 6 | **Rating scale mismatch.** Users rate 1–5, summary shows "/10" with stars filled at `rating/2`. | `review-section.tsx:108,132`; `novel-details/index.tsx:450-468` | S | ★★ |
| 7 | **No search anywhere except the `/series` page**, and there it needs a submit. No header search, no bottom-nav search, no suggestions. | `navigation/index.tsx`; `filter/index.tsx` | M | ★★★ |
| 8 | **"Continue" reopens the chapter you already finished** instead of the next one. Same on the library card. | `cover-and-actions.tsx:141-147`; `ongoing/card.tsx:40,86` | S | ★★ |
| 9 | **Logging in to bookmark, like or comment drops you on the home page.** Those buttons push `/account/login` without `?redirect=`. | `chapter/index.tsx:272`; `novel-details/index.tsx:289,322`; `comment-form.tsx:36`; `comment-item.tsx:71` | S | ★★ |
| 10 | **Fake community stats shown as live numbers** ("1,247 active readers online right now"). | `home/community-stats.tsx:14-39,85` | S | ★★ (trust) |

---

## 2. Reading experience

### 2.1 A real distraction-free reader (M, ★★★)
- Move the chapter route out from under the site chrome. Options: a route group `app/(reader)/series/[slug]/chapter/[chapter]` with its own minimal layout, or have the `(site)` layout hide nav, banner, bottom tab bar and footer when the pathname matches a chapter. The reader should own the whole viewport.
- Make "fullscreen" mean something: hide the reader header and bottom bar on scroll-down, show on scroll-up or tap. Keep only the thin progress line.
- Fix the z-index stack once: progress line > floating title bar > reader header > content.
- Add tap-to-toggle chrome on mobile (tap centre of article), and optional left/right edge tap to go prev/next.

### 2.2 In-reader chapter navigation (M, ★★★)
- Add a chapter-list drawer opened from the reader header (reuse `content-dialog-drawer.tsx`) with search-by-number, current chapter highlighted, read/locked markers, and "jump to latest".
- Prefetch the next chapter body when the user passes ~70% scroll, so the next-chapter turn renders instantly. Today every turn shows a full skeleton because the body is fetched in `useEffect` after mount (`chapter/index.tsx:172-193`).
- Keep the prev/next bar but also add a big "Next chapter" card at the end of the article (title, premium badge, price if locked), followed by the sponsor/upsell surfaces from the monetization plan.
- Guard keyboard shortcuts against modifier keys (`Cmd+Arrow` currently changes chapter, `:245-267`) and add a small "?" legend.

### 2.3 Progress that reflects reading, not opening (M, ★★★)
- Today a chapter is marked read the instant it loads (`chapter/index.tsx:196-202`). Post progress when the reader reaches ~90% of the article, or on unmount with the scroll percentage.
- Persist scroll position per chapter (`sessionStorage`) and restore it on return. Nothing does this today.
- Extend the reading-progress API with a per-chapter percentage so the library can show "Ch. 42 · 60%" and the series page can resume mid-chapter.

### 2.4 Reader settings readers expect (M, ★★)
Existing: 4 themes, font size, line height. Add:
- Font family (serif / sans / dyslexia-friendly), content width (narrow / normal / wide), paragraph spacing, text alignment, optional justification.
- Brightness / warmth overlay for night reading.
- Apply the saved theme before first paint. Default state is `"midnight"` and localStorage is read in an effect (`:160, :216-226`), so light-theme readers get a dark flash on every chapter. Read it in a `useLayoutEffect` or an inline script, or store it in a cookie and pass it from the server component.
- Turn the settings panel into a proper dialog: focus trap, `Escape` closes it, `aria-label` on the five icon-only header buttons (`:435-497`).

### 2.5 Content and rendering (S–M, ★★)
- **Render translator notes.** `chapter.notes` exists on the response (`api/types.ts:199`) and is never displayed. Show them in a collapsible block under the title or at the end.
- Route inline images through `next/image` or at least set width/height; `renderer.tsx:279` emits a raw `<img>`, which causes layout shift.
- Throttle the two scroll listeners (`chapter/index.tsx:97, :241`) with `requestAnimationFrame`; each currently re-renders the whole 824-line component per scroll frame.
- Give the reader a `<main>` landmark and a skip link.
- Respect `prefers-reduced-motion` for the magic-tag effects.

### 2.6 Bigger reader features (L, ★★)
- **Manga / manhwa mode.** The filter already offers these types (`filter/index.tsx:14-18`) but the reader has no vertical image-strip mode. Plan a `novelType`-switched renderer with lazy-loaded pages and preloading of the next 2 images.
- **Text-to-speech** using the Web Speech API: play/pause, speed, voice, auto-advance to next chapter. Cheap to add, valued by commuters.
- **Offline / PWA.** Add a manifest and a service worker that caches the last N read chapters and the library. See 7.4.

---

## 3. Series page

- **Chapter list markers** (see #3 above): current chapter highlighted, read chapters dimmed, purchased chapters ticked, locked chapters with price. The price and countdown are currently commented out (`chapters-section.tsx:121-132`), so a premium row is just a padlock.
- **Sort newest/oldest** and a real "search within chapters" (by number or title). Today the search icon sits on a numeric jump box (`chapters-section.tsx:53`), and out-of-range input fails silently (`:59-68`).
- **Paginate the list without reloading the page**: fetch chapters separately from series details so only the list section shows a skeleton.
- **Continue-reading CTA logic**: "Start reading" when no progress, "Continue Ch. N+1" when progress exists, "Read latest" when caught up. Show percent if per-chapter progress lands.
- **Move rating below the fold** and only prompt after some reading. Rating a series before opening a chapter is odd (`novel-details/index.tsx:480-489`), and the average never refreshes after rating because `onRatingUpdate` is a no-op.
- **Make tags clickable** links to `/series?categories=…` (they are plain spans, `:394-401`). Add "More like this" (same genres) and "Also by this translator" rails at the bottom.
- **Truncate the description** with "Read more" (`overview-section.tsx:13`). Fix `HtmlProse`: it claims to sanitise but doesn't (`ui/html-prose.tsx:12-20`), and hardcodes `text-white` so it's unreadable on a light theme. Sanitise with DOMPurify or move to a server-rendered sanitised string.
- **Add "Add to to-read"** action next to bookmark, once the library tab is real.
- The 404 fallback search box says "Search is not implemented yet" (`:131-134`) even though `/series?search=` works. Wire it.
- Share should include a proper OG card (see 7.5); today every link previews as "Mythoria".

---

## 4. Discovery and search

- **Global search** in the header and bottom nav: debounced-as-you-type dropdown with top 5 series (cover, title, genres), "See all results" to `/series?search=`. Recent searches in localStorage.
- **Filters**: sync every change to the URL immediately (only sort does today, and via a `setTimeout` that can read stale state, `filter/index.tsx:149`). Show removable active-filter pills above the grid.
- **Load genres from the API** (`getCategoriesAction` exists and is unused, `server-actions/series.ts:96`) instead of the hardcoded 15 (`filter/index.tsx:20-24`). Align status values: filter sends `on-hold`, display expects `hiatus`.
- **Pagination**: real `href`s (currently `#` + preventDefault, `utility/pagination.tsx:90,127`), scroll to top on page change, and consider "Load more" on mobile.
- **Card interactions**: chapter rows on cards should link to the chapter, not the series (`novel-card.tsx:131`). Add hover preview with description on desktop.
- **Empty and error states** with actions: "Clear filters", "Try 'cultivation'", and a retry button.
- Desktop grid maxes at 3 columns (`series/index.tsx:104`); 4–5 fits a catalogue page.

---

## 5. Library ("My Novels")

- **Ship or hide the placeholders.** "To-read" is a "We're still working on this" card (`to-read/index.tsx`), and "Completed" is commented out with mock data. Either implement both (to-read needs a backend list; completed can be derived from `lastChapterNumber === totalChapters && status === completed`) or remove the tab.
- **Unread counts.** `OngoingSeriesItem` carries `lastChapterNumber` and `totalChapters`; surface "3 new chapters" badges on cards and a count on each tab trigger.
- **Merge bookmarks and progress**: a bookmarked card should show last-read chapter, a Continue button and new-chapter count, not just "Bookmarked 3 days ago" (`bookmarked/card.tsx:73-113`).
- **Gate auth once at the page**, not in each tab (`ongoing/index.tsx:29-32`, `bookmarked/index.tsx:45-48`). Logged-out users currently see the page frame, then get bounced.
- Sorting (recently read / recently updated / A–Z), search within library, "remove from reading", and pagination for large libraries.
- Replace `window.location.reload()` error recovery with a refetch.
- **Updates feed**: a "New chapters from your library" list (also a good home rail) and, later, notifications.

---

## 6. Home

- Replace the fake stats block with real numbers from existing endpoints, or turn it into an honest "Invite a friend" / Discord CTA.
- Add a **"New in your library"** rail for signed-in users and a **"Because you read X"** rail (genre affinity from reading history). Right now Continue Reading is the only personalised block.
- The upcoming-releases bell only toggles copy (`upcoming-releases.tsx:52,78`). Either wire it to a follow/notify endpoint or remove it.
- Fetch rail data server-side and stream sections with `Suspense` instead of 8 independent client fetches with fixed-height placeholders (see 9.1). This also removes the placeholder jump from `LazySection`.
- Delete dead rails and mock files: `curated-collections.tsx`, `discover-banner.tsx`, `mock-data.ts`, `popular-today/`, `latest/test-data.ts`, `most-popular/test-data.ts`.

---

## 7. Shell, navigation, theming, SEO

### 7.1 Navigation (S–M)
- Search entry point in header and bottom nav (see 4).
- Signed-out state: a clear "Sign in" in the mobile bar, not buried under More (`navigation/index.tsx:339-346`).
- Pass `?redirect=` from every login push (see #9).
- `aria-label` on the coin and More buttons (`:178, :451`); throttle the scroll handler (`:56`).
- Toast on logout.

### 7.2 Site theme (M, ★★)
- There is no site-level dark/light toggle. `next-themes` is installed but no `ThemeProvider` is mounted, so `useTheme()` always returns "system" and the toast theme is wrong. Dark is baked in via `color-scheme: dark` (`globals.css:151`).
- Mount `ThemeProvider`, add a toggle in the header and More drawer, and let the reader theme optionally follow the site theme. A light-theme reader currently gets a dark shell around a light page.

### 7.3 Loading, errors, 404 (S)
- Add `loading.tsx` and `error.tsx` under `(site)` and the dynamic routes; there are none, so any render error shows the unstyled Next error screen.
- Move `not-found.tsx` inside `(site)` so it has nav and footer, use theme tokens instead of hardcoded slate/amber, and guard its animations with `prefers-reduced-motion`.
- Persist announcement-banner dismissal (localStorage keyed by announcement id); it reappears on every reload (`banner/index.tsx:58,226`).

### 7.4 PWA (M, ★★)
- Add `app/manifest.ts`, icons, `apple-*` meta, and a service worker (e.g. Serwist) caching shell + recent chapters. "Add to home screen" matters for a reading app used daily on phones.

### 7.5 SEO and sharing (M, ★★★ for growth)
- Add `generateMetadata` to `/series/[slug]` and the chapter route: title, description, OG image (cover), Twitter card, canonical. Add `metadataBase` and fix the "noveels" typo in `app/layout.tsx:7-10`.
- Add JSON-LD (`Book` / `Chapter` with `isAccessibleForFree`), `robots.ts`, and chapters in the sitemap.
- Cache `sitemap.ts`; it currently walks the whole catalogue with sequential requests at request time.
- Server-render the first paint of series and chapter pages (see 9.1). Crawlers see empty shells today.

### 7.6 Accessibility (S–M)
- Skip-to-content link, `<main>` landmarks, labelled icon buttons, visible focus rings, `aria-live` on error banners, `prefers-reduced-motion` guards around framer-motion in nav, banner and Featured. The whole tree has 28 `aria-*` attributes.

---

## 8. Accounts

- **Profile / settings page** (`/settings`): display name, avatar, email, change password, notification preferences, connected accounts (Google / Discord), delete account. None of this exists.
- **Purchase history and "My unlocked chapters"**: the action and route already exist (`getUserCoinPurchasesAction`, `routes/server.ts:38`) and are unused. Readers have no record of what they bought.
- **Email verification** flow (no route, no field today).
- **Form quality**: use the already-installed `zod` + `react-hook-form` + `ui/form.tsx`. Add confirm-password, strength meter, username rules, `aria-invalid` / `aria-describedby`.
- Remove the 100 ms `setTimeout` "wait for cookie" race (`login/index.tsx:64`, `register/index.tsx:69`); await the `/account/me` refresh instead.
- Optional: "Continue as guest" reading with a soft prompt to sign in after N chapters, plus a one-time onboarding (pick 3 genres) that seeds recommendations.

---

## 9. Comments and community

- Likes/upvotes, sort by newest/top, pagination or "load more" (the whole thread is fetched in one call, `api/interface.ts:848`), edit, spoiler tag with blur, report, and avatars.
- Optimistic updates instead of refetching the entire list on every post/reply/delete (`comment-section.tsx:76-82`), which also collapses open reply boxes.
- Pass `seriesId` / `chapterId` down from the section as props; `comment-item.tsx:85-86` relies on optional fields the API may omit, so replies could post with no target.
- Replace `window.confirm` with the app dialog; show a reply affordance to signed-out users that prompts login with redirect.
- Use theme tokens instead of hardcoded `#27272A` (`comment-form.tsx:75,82`; `comment-item.tsx:136,185`), which clashes with all four reader themes since comments render inside the reader.
- Collapse deep threads on mobile ("Show 4 replies") instead of fixed `ml-8` per level.
- Count replies in the total. Paragraph-level comments (Wattpad-style) are a strong later addition once reactions exist.

---

## 10. Performance and architecture

### 10.1 Server-render the first paint (L, ★★★)
Every page is a thin server component delegating to a client component that fetches in `useEffect` via a server action wrapping axios. Effects: mandatory skeleton on every navigation, no caching or dedupe, waterfalls, empty HTML for crawlers and social previews.

Recommended direction, page by page starting with the reader and series page:
- Fetch series details / chapter body in the server component (`page.tsx`) with `fetch` + `next: { revalidate }` (public data) or the forwarded cookie (user data), and pass as props. Keep interactivity in the client component.
- Batch user state: the series details call already forwards the cookie, so it could return `isBookmarked`, `isLiked`, `myRating`, `lastReadChapter` in one response instead of 3–4 follow-up requests (`novel-details/index.tsx:239-270`, `review-section.tsx:39`).
- Stream home rails with `Suspense`.
- Add a small client cache (SWR or TanStack Query) for balance, bookmarks and library so navigating back doesn't refetch everything.

### 10.2 Bundle (S)
- `framer-motion` is in the initial chunk via `Navigation` and the banner; lazy-load the animated parts or swap for CSS transitions in the shell.
- Remove `@tiptap/*` (only reachable from the unimported `inbuilt-editor.tsx`), `react-icons` (3 icons, `lucide-react` covers them), and the dead files listed by the audit (`utils/reading-progress.ts`, `shared/engagement-hook-card.tsx` and `social-proof-bar.tsx` unless the monetization plan reuses them, `ui/multi-select.tsx`, test-data files, `reading/tabs/content/completed/`, editor and toolbar files).

### 10.3 Small correctness items (S)
- `ChapterReaderSkeleton` uses `Math.random()` in JSX (`chapter/index.tsx:129`), so it jitters between renders.
- `bookmarked/index.tsx` shadows the imported `redirect` with a local const and omits it from a dependency array.
- Several cards reference `/placeholder.svg`, which is not in the repo.

---

## 11. Suggested order

| Phase | Scope | Effort | Why first |
|---|---|---|---|
| A — Fix what's broken | Items 1, 4, 5, 6, 8, 9, 10 from section 1; render translator notes; `loading.tsx` / `error.tsx`; login redirects | S each | Real bugs users hit today, all under a day each |
| B — Reader that owns the screen | Reader route group / hidden chrome, z-index fix, chapter-list drawer, next-chapter prefetch, tap zones, progress on read-not-open, scroll restore, theme-before-paint, settings dialog + extra settings | M–L | Reading is the product; this is where retention lives |
| C — Know where you are | Chapter list markers (needs `isRead` / `isPurchased`), Continue = next chapter, unread counts in library, merged bookmark + progress cards, real To-read / Completed tabs | M | Turns the library from a list into a reason to come back |
| D — Find things | Global search with suggestions, URL-synced filters and pills, API-driven genres, real pagination links, clickable tags, related series | M | Discovery drives both reading and first purchases |
| E — Shell and growth | Site theme toggle, PWA manifest + offline cache, `generateMetadata` + JSON-LD + server-rendered first paint on series/chapter, accessibility pass | M–L | SEO and sharing are the main acquisition channels; also a prerequisite for the ads plan |
| F — Accounts and community | Settings/profile page, purchase history + unlocked chapters, email verification, comment likes/sort/pagination/spoilers, updates feed and notifications | M–L | Rounds out the platform once the core loop is solid |
| G — Bigger bets | Manga mode, text-to-speech, recommendations from reading history, paragraph comments | L | Differentiators once the basics are done |

Phases A and B are the highest return per hour and should go before any of the monetization work in `docs/monetization-plan.md`; a membership upsell inside a reader whose unlock button appears to do nothing will convert poorly.
