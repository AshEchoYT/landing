# Events.Echo — Frontend Completion PRD (Post Landing Page)

**Objective:** Extend the existing Events.Echo landing page into a full-featured frontend application, integrating fully with the Events.Echo backend (Local MongoDB + JWT + Stripe). Build all remaining pages, refine landing page text, and ensure consistent futuristic neon-green theme, animations, and production-ready API connectivity.

---

## Design System & Theme
- **Primary Colors:** Neon Green `#00FF88`, Electric Cyan `#00E5FF`, Background `#0A0A0A`.
- **Typography:** Poppins (headings), Inter (body).
- **UI Style:** Futuristic cyberpunk aesthetic with glassmorphism, soft glow, and particle/blur accents.
- **Motion System:** Framer Motion for page transitions, hover glows, and micro-interactions. Lottie for success/confetti.

---

## Project Structure (Suggested)
```
src/
├── api/
│   ├── authApi.js
│   ├── eventsApi.js
│   ├── seatMapApi.js
│   ├── paymentsApi.js
│   ├── ticketsApi.js
│   └── organizerApi.js
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── EventCard.jsx
│   ├── SeatGrid.jsx
│   ├── Loader.jsx
│   ├── Modal.jsx
│   ├── Toast.jsx
│   └── AnimatedButton.jsx
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useFetch.js
│   ├── useStripe.js
│   └── useSeatMap.js
├── pages/
│   ├── Landing/
│   │   └── LandingPage.jsx
│   ├── Auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── ForgotPasswordPage.jsx
│   ├── Events/
│   │   ├── EventsList.jsx
│   │   └── EventDetails.jsx
│   ├── SeatMap/
│   │   └── SeatSelectionPage.jsx
│   ├── Checkout/
│   │   └── CheckoutPage.jsx
│   ├── Tickets/
│   │   └── MyTicketsPage.jsx
│   ├── Organizer/
│   │   ├── Dashboard.jsx
│   │   ├── CreateEventForm.jsx
│   │   ├── ManageEvents.jsx
│   │   └── Analytics.jsx
├── store/
│   ├── useUserStore.js
│   ├── useSeatStore.js
│   └── useEventStore.js
├── utils/
│   ├── constants.js
│   ├── formatters.js
│   └── stripeConfig.js
├── App.jsx
├── main.jsx
└── index.css
```

---

## Landing Page (Minor Edits)
- Keep visuals as-is. Adjust copy to match brand voice:
  - **Main Title:** “Echo the Energy. Experience the Future of Live Events.”
  - **Subtitle:** “Discover, book, and attend concerts and experiences reimagined.”
  - **Primary CTA:** “Explore Events” → `/events`
  - **Secondary CTA:** “Organize an Event” → `/organizer`
- Ensure Navbar & Footer are componentized and reused across pages.
- Add smooth scroll and section preview transitions to sync with other pages.

---

## Pages & Detailed Functionalities

### Auth Pages (`/login`, `/register`, `/forgot-password`)
**Design:** Neon glass panel forms with animated input focus.
**Functionality:**
- Register: `POST /api/auth/register` (role: attendee/organizer).
- Login: `POST /api/auth/login`.
- Store access token in memory/store; refresh token handled via httpOnly cookie.
- Redirect to `/events` on success. Provide animated toasts for errors.

---

### Events Listing Page (`/events`)
**Design:** 3-column responsive grid, animated filter drawer, debounced search.
**Functionality:**
- Fetch with `GET /api/events`.
- Filters: type, date range, city, tags. Use query params for server-side filtering.
- Event cards show image, date, tags, price range, and availability badges.
- Hover interactions: lift + glow; click navigates to `/events/:id`.

---

### Event Details Page (`/events/:id`)
**Design:** Animated hero banner, organizer panel, CTA.
**Functionality:**
- Fetch `GET /api/events/:id`.
- Show event metadata, venue, tags, and related events.
- CTA: “Book Your Seat” → `/events/:id/seatmap`.
- Animated section reveals and related events carousel.

---

### Seat Map Selection Page (`/events/:id/seatmap`)
**This is the core, must be best-in-class.**

**APIs:**
- `GET /api/events/:id/seatmap` → seat layout and status
- `POST /api/reservations` → create temporary reservation
- `DELETE /api/reservations/:id` → cancel

**UI/UX Requirements:**
- **Stage View:** Top-centered stage with light animation.
- **Seat Rendering:** SVG-based or canvas-rendered seat map supporting large seat counts; fallback to grid for simple venues.
- **Seat States & Visuals:**
  - **Available:** neon green glow, hover increases glow and scale
  - **Reserved:** amber glow with subtle pulsing edge
  - **Sold:** matte gray with cross overlay, non-interactive
- **Selection Interaction:**
  - Click to select → immediate local feedback (pulse + add to bottom summary).
  - On selection, call `POST /api/reservations` with seatIds to create server reservation.
  - Show TTL countdown (e.g., 10 minutes) in Booking Summary Bar.
  - If reservation expires, visually revert seat to available and notify user.
- **Bottom Booking Summary Bar:**
  - Sticky fixed bar showing selected seats, subtotal, fees, and total.
  - Countdown timer visible; button “Proceed to Checkout” disabled if reservation invalid.
- **Performance & Accessibility:**
  - Virtualize seats for performance (e.g., react-window) if seat count large.
  - Keyboard navigation support: arrow keys to traverse seats, Enter to select.
- **Animations:**
  - Staggered reveal of seats on load, hover glow, selection pulse, and smooth pan/zoom.
  - Subtle shader reflections and parallax cursor movement for 3D feel.
- **Extras:**
  - Auto “best seats” suggestion using pricing tiers and proximity to stage.
  - Tooltip on hover showing seat metadata (category, price, row).

**Reservation Flow:**
1. User selects seats (frontend creates temporary reservation via `POST /api/reservations`).
2. Backend responds with reservationId and expiresAt.
3. Frontend displays countdown and locks seats visually.
4. On timeout or cancel, frontend calls `DELETE /api/reservations/:id` (or server auto-cleans via TTL) and updates UI.
5. On proceeding to checkout, pass reservationId to `/api/payments/create-intent`.

---

### Checkout Page (`/checkout`)
**APIs:**
- `POST /api/payments/create-intent` → returns `clientSecret`.
- Webhook `/api/webhooks/stripe` finalizes booking.

**Flow & UX:**
- Stepper with three steps: Review → Payment → Confirmation.
- Use Stripe Elements for card input with neon focus styling.
- On payment success, show Lottie animation and fetch updated ticket data.
- Handle payment failures gracefully with retry animation and toast.

---

### My Tickets Page (`/tickets`)
**API:** `GET /api/users/:id/tickets`.
**Functionality:**
- Render list of ticket cards with QR code, event info, seat number.
- Download PDF option (client-side generation using jsPDF or server-side endpoint).
- “Share” functionality copies deep link to clipboard with animation.
- Ticket card expand shows more metadata and organizer contact.

---

### Organizer Dashboard (`/organizer`)
**Purpose:** Event creation, management, and analytics.
**Functionality:**
- Role-protected route.
- **Create Event Wizard:** multi-step -> basic info → seat map upload → pricing and publish.
- **Manage Events:** list with edit/delete; quick stats for each event.
- **Analytics:** charts for revenue, tickets sold per category; filters by date range.
- **Vendor/Sponsor Management:** CRUD panels linked to event.

---

## Common Components & Utilities
- **Navbar & Footer:** reuse landing page components; add authenticated state handling.
- **Modal & Toast System:** consistent animations and accessible focus traps.
- **Auth Context:** manage tokens, auto-refresh access tokens via `/api/auth/refresh`.
- **API Helpers:** centralize error handling, response normalization, and polling utilities.

---

## Accessibility & Performance
- Ensure keyboard navigation for seat map, forms, and modals.
- Respect `prefers-reduced-motion` for accessibility.
- Virtualize long lists and large seatmaps to keep frame rate high.

---

## Integration Checklist (Frontend → Backend)
- [ ] `/api/auth/*` implemented and tested.
- [ ] `/api/events`, `/api/events/:id` available and consumed.
- [ ] `/api/events/:id/seatmap` returns reliable seat data.
- [ ] `/api/reservations` create/delete flows stable with TTL.
- [ ] `/api/payments/create-intent` produces valid `clientSecret`.
- [ ] Webhook `/api/webhooks/stripe` finalizes tickets and payments.
- [ ] `/api/users/:id/tickets` returns correct ticket payloads.

---

## Implementation Checklist (Frontend)
- [ ] Add Auth Context and Protected Routes.
- [ ] Create Events list and details pages.
- [ ] Implement Seat Map component with reservation logic and animations.
- [ ] Implement Checkout with Stripe Elements and confirm flows.
- [ ] My Tickets page with PDF download & QR.
- [ ] Organizer Dashboard with full CRUD and analytics.
- [ ] UX polish: consistent animations, loaders, modals, and toasts.

---

## Master Prompt for Copilot / v0
> “Use this PRD `Events.Echo — Frontend Completion PRD (Post Landing Page)` as the single source of truth. The landing page is already done — make minor copy edits only. Build the rest of the frontend pages exactly as specified, ensuring full API compatibility with the Events.Echo backend PRD. Prioritize the Seat Map component to be best-in-class: SVG/canvas rendering, reservation TTL, keyboard navigation, virtualization for large seat counts, and a futuristic neon animation system. Use React (Vite), TailwindCSS, Framer Motion, React Router, and Stripe Elements. Follow the integration and implementation checklists strictly and produce production-quality, well-structured code with readable components and hooks.”

---

*End of file.*

