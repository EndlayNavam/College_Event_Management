# College Event Management System

Full-stack event workflow system with three role-based dashboards:

- Student Dashboard: event discovery, search/filter, status tags, pagination, registration.
- Organizer Dashboard: create event form, live card preview, draft/pending workflow.
- Administration Dashboard: pending moderation queue, approve/reject, active/rejected sections.

## Tech Stack

- Frontend: React (Vite), React Router, Axios, React Icons
- Backend: Node.js, Express, SQLite (SQL), JWT auth
- Styling: custom pastel UI with responsive sidebar, hover transitions, card animations, skeleton loaders

## Project Structure

```text
Event Management/
  client/  # React app
  server/  # Express API
  database/sql/  # SQL table scripts
```

## Setup

1. Install dependencies:

```bash
cd server && npm install
cd ../client && npm install
```

2. Configure environment variables:

- Copy `server/.env.example` to `server/.env`
- Copy `client/.env.example` to `client/.env`

3. Seed demo data (optional but recommended):

```bash
cd server
npm run seed
```

4. Start backend:

```bash
cd server
npm run dev
```

5. Start frontend:

```bash
cd client
npm run dev
```

## Demo Accounts (after seed)

- Admin: `admin@college.edu` / `admin123`
- Organizer: `organizer@college.edu` / `organizer123`
- Student: `student@college.edu` / `student123`

## Implemented Requirements

- Role-based auth (`student`, `organizer`, `admin`) with JWT
- SQL-based schema managed from root `.sql` files in `database/sql/`
- Student event cards with:
  - Event Name, Club, Date, Timings, Venue, Cost, Category, Description, Prizes
  - Register action
  - Search + filters (category/date/club/status)
  - Pagination
  - Hover scale + border highlight + hover CTA
- Organizer flow:
  - Event creation form with all required fields
  - Save as draft or submit for approval
  - Pending/draft list and move draft to pending
  - Live preview card
- Admin flow:
  - Pending event list
  - Approve/Reject controls
  - Approved events visible to students
  - Rejected events hidden from student listing
  - Status tags + progress bars
  - Fade-in moderation buttons on card hover
- Responsive UI:
  - Desktop and mobile layout
  - Collapsible mobile sidebar
  - Smooth transitions and loading animations
