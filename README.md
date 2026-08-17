# 🎟️ Event Management & Ticketing System

> A role-based event discovery, ticketing, organizer management, and event-operations platform built as an **8-hour Odoo hackathon practice prototype**.

The project focuses on one connected business flow:

```text
Attendee discovers event
        ↓
Books ticket
        ↓
Ticket inventory decreases
        ↓
Organizer sees booking
        ↓
Event day
        ↓
Staff check-in
        ↓
Attendance updates
        ↓
Organizer / Admin analytics
```

---

## ✨ What the Platform Does

The system is designed around three primary roles:

### 👑 Admin

Platform-level control:

- Review organizer applications
- Approve / reject organizers
- View users
- View organizers
- View events
- Monitor bookings
- Monitor payments
- View platform statistics

### 🎪 Organizer

Event-level management:

- Create and manage events
- Set ticket price and quantity
- Monitor ticket inventory
- View attendee bookings
- Manage event staff
- Monitor attendance
- View event analytics

### 👤 Attendee

Customer-facing experience:

- Register and log in
- Discover upcoming events
- View event details
- Book tickets
- View tickets and booking history
- Apply to become an organizer
- Track organizer application status

---

## 🔥 Core Business Flow

### Organizer onboarding

```text
Attendee
   ↓
Apply to Become Organizer
   ↓
Admin Reviews Application
   ↓
Approve / Reject
   ↓
Approved User → Organizer
```

### Event creation

```text
Organizer
   ↓
Create Event
   ↓
Set Ticket Price + Quantity
   ↓
Platform Fee Calculated
   ↓
Organizer Pays Platform Fee
   ↓
Event Published
   ↓
Event Appears on Public Discovery Page
```

### Ticket booking

```text
Public Event Discovery
   ↓
Event Details
   ↓
Book Now
   ↓
Login Required if not authenticated
   ↓
Booking Form
   ↓
Select Quantity
   ↓
Accept Terms & Privacy Policy
   ↓
Pay Now
   ↓
Booking Confirmed
   ↓
Ticket Inventory Updated
```

### Event-day operations

```text
Organizer
   ↓
Register / Assign Staff
   ↓
Event Day
   ↓
Staff Verifies Ticket
   ↓
Check-in
   ↓
Attendance Recorded
   ↓
Organizer Dashboard Updated
```

---

## 🧩 Core Modules

| Module | Purpose |
|---|---|
| Authentication | Login, registration, role-aware access |
| Event Discovery | Public browsing of upcoming events |
| Event Details | Full event information and booking entry point |
| Organizer Applications | Attendee → Organizer approval workflow |
| Event Management | Organizer event creation and management |
| Ticketing | Ticket quantity, pricing and availability |
| Bookings | Attendee booking and organizer/admin visibility |
| Staff Management | Register and assign event staff |
| Attendance | Event-day check-in tracking |
| Payments | Organizer platform fees and attendee ticket payments |
| Reports & Analytics | Event, booking, attendance and platform insights |

---

## 🏗️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- React Router
- Axios
- Lucide React
- Custom CSS

### Backend

- Node.js
- Express.js
- PostgreSQL
- `pg` PostgreSQL client

### Development Approach

The team follows:

```text
PLAN
  ↓
FEATURE CONTRACT
  ↓
FRONTEND + BACKEND IN PARALLEL
  ↓
INTEGRATION
  ↓
TESTING
  ↓
DONE
  ↓
NEXT FEATURE
```

---

## 📁 Project Structure

```text
Event-and-ticket-management-system/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── bookings/
│   │   │   ├── common/
│   │   │   ├── events/
│   │   │   └── staff/
│   │   │
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── attendee/
│   │   │   └── organizer/
│   │   │
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── scripts/
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- PostgreSQL

---

### 1. Clone the repository

```bash
git clone https://github.com/Innerkidd/Event-and-ticket-management-system.git
cd Event-and-ticket-management-system
```

---

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

Vite will provide the local development URL.

---

### 3. Install backend dependencies

Open another terminal:

```bash
cd backend
npm install
```

---

### 4. Configure environment variables

Create a local `.env` file inside `backend/`.

Example:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
PORT=5000
```

For the frontend, configure the API base URL in:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

> Never commit real passwords, API keys, database credentials, or other secrets.

---

### 5. Initialize the database

From the `backend` directory:

```bash
npm run db:init
```

Then start the backend:

```bash
npm run dev
```

Or:

```bash
npm start
```

---

## 🔐 Authentication & Roles

The application is designed around role-aware access:

```text
ATTENDEE
   ↓
Attendee account

ORGANIZER
   ↓
Approved organizer account

ADMIN
   ↓
Platform administrator
```

A normal user should not directly select the Organizer or Admin role during registration.

Organizer access is obtained through:

```text
Organizer Application
        ↓
Admin Review
        ↓
Approval
```

---

## 💳 Payment Model

The project uses two distinct financial flows.

### Organizer Platform Fee

Before an organizer publishes an event:

```text
Maximum Ticket Value
=
Ticket Price × Published Ticket Quantity

Organizer Fee
=
Maximum Ticket Value × Platform Fee %
```

Example:

```text
Ticket Price          ₹500
Published Tickets     1000
Maximum Ticket Value  ₹5,00,000
Platform Fee          5%
Organizer Fee         ₹25,000
```

The intended flow is:

```text
Create Event
   ↓
Calculate Platform Fee
   ↓
Pay Platform Fee
   ↓
Publish Event
```

### Attendee Ticket Payment

Attendees pay for tickets during the booking flow.

These are conceptually separate:

```text
Organizer → Platform Fee
Attendee  → Ticket Payment
```

---

## 🎫 Ticket Inventory

Each event tracks:

```text
Total Tickets
Sold Tickets
Available Tickets
```

Example:

```text
Total       500
Sold        320
Available   180
```

The final booking system must prevent users from booking more tickets than are available.

---

## 🧑‍💼 Staff & Attendance

Staff is managed inside the Organizer Dashboard.

There is no separate Staff Dashboard.

Typical flow:

```text
Organizer
   ↓
Add / Register Staff
   ↓
Assign Staff to Event
   ↓
Event Day
   ↓
Ticket Verification
   ↓
Check-in
   ↓
Attendance Record
```

Example event metrics:

```text
Registered: 200
Checked-in: 150
Remaining: 50
```

---

## 🖥️ Dashboard Structure

### Admin

```text
Dashboard
Users
Organizers
Events
Bookings
Payments
Reports & Statistics
```

### Organizer

```text
Dashboard
My Events
Create Event
Tickets
Bookings
Staff Management
Attendance
Event Analytics
```

### Attendee / My Account

The attendee experience is centered around the public discovery flow and a personal account area:

```text
Profile
My Tickets
Booking History
Organizer Application
```

There is no need for a separate attendee management dashboard in the current product direction.

---

## 🎯 MVP Priorities

The most important product flow is:

```text
Authentication
   ↓
Organizer Approval
   ↓
Event Creation
   ↓
Event Discovery
   ↓
Ticket Booking
   ↓
Ticket Inventory
   ↓
Organizer Booking Visibility
```

After the core flow is stable:

```text
Staff Management
   ↓
Attendance
   ↓
Analytics
```

Advanced features should come only after the core system is working reliably.

---

## 🚧 Future / Secondary Features

These are intentionally not the first development priority:

- Advanced payment gateway integration
- AI event recommendations
- AI chatbot
- Automated email notifications
- Reviews and ratings
- Social sharing
- Advanced analytics
- Real-time notifications
- Advanced QR scanning

---

## 👨‍💻 Team

| Member | Primary Responsibility |
|---|---|
| **Shlok** | Primary Frontend Developer |
| **Mohit** | Primary Backend Developer |
| **Disha** | Secondary Frontend Developer |
| **Kriza** | Secondary Backend Developer |

The team works feature-by-feature rather than finishing the entire frontend before starting backend development.

---

## 🤖 AI-Assisted Development Workflow

The team uses different AI tools for different purposes.

### ChatGPT

- Learning
- Architecture discussions
- Debugging
- Technical suggestions
- Reviewing implementation decisions

### Claude

- Detailed implementation plans
- Feature breakdown
- Codebase analysis
- Implementation strategy

### Antigravity + Gemini

- Actual code implementation
- Frontend development
- Applying approved implementation plans

The team treats the implementation plan as the source of truth and avoids letting an AI agent randomly redesign the architecture.

---

## 🔄 Development Workflow

For each feature:

```text
Requirement
    ↓
Planning
    ↓
Frontend + Backend Parallel Development
    ↓
Integration
    ↓
Testing
    ↓
Bug Fixing
    ↓
Feature Complete
```

This workflow was specifically practiced during the team's first full 8-hour mock round.

---

## 🏆 Hackathon Demo Story

The intended end-to-end demonstration is:

```text
ADMIN
  ↓
Approves Organizer
  ↓
ORGANIZER
  ↓
Creates Event
  ↓
Pays Platform Fee
  ↓
Event Published
  ↓
ATTENDEE
  ↓
Discovers Event
  ↓
Logs In
  ↓
Books Ticket
  ↓
Ticket Inventory Decreases
  ↓
ORGANIZER
  ↓
Sees Booking
  ↓
Assigns Staff
  ↓
EVENT DAY
  ↓
Staff Checks In Attendee
  ↓
Attendance Updated
  ↓
ORGANIZER / ADMIN
  ↓
Statistics & Analytics
```

The goal is to demonstrate one connected business workflow rather than a collection of disconnected pages.

---

## ⚠️ Development Notes

- Keep `.env` files local and never commit secrets.
- Do not use fake production data in final functionality.
- Backend should remain the authority for ticket availability, pricing, booking validity, payments, and role authorization.
- Frontend should provide the user experience and communicate with the backend through the agreed contracts.
- Keep the architecture simple enough for hackathon development and maintenance.

---

## 📌 Project Status

This repository is the team's **8-hour mock hackathon prototype** and serves as the baseline for future iterations.

The project is being continuously expanded toward the finalized Event Management & Ticketing System workflow described above.

---

## 📄 License

This project is currently released under the repository's configured license.

See [`LICENSE`](./LICENSE) for details.
