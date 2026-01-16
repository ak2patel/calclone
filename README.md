# Cal.com Clone

A modern, responsive scheduling platform clone built with React, Node.js, and MySQL.

## 🚀 Features

*   **Event Type Management**: Create, edit, and delete custom event types (e.g., "15 Min Meeting").
*   **Availability Scheduling**: Set your weekly availability with granular control.
*   **Timezone Support**: Automatically detects and handles timezones for both host and booker.
*   **Public Booking Page**: Shareable link for others to book slots with you.
*   **Double Booking Prevention**: Smart logic prevents overlapping bookings across different event types.
*   **Dark Mode**: Fully responsive dark/light theme toggle.
*   **Responsive Design**: Optimized for Mobile, Tablet, and Desktop.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, Lucide Icons
*   **Backend**: Node.js, Express.js
*   **Database**: MySQL (TiDB Cloud compatible)
*   **Deployment**: Vercel (Frontend) + Render (Backend)

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v14+)
*   MySQL Server (Local or Cloud)

### 1. Clone the Repository
```bash
git clone https://github.com/ak2patel/calclone.git
cd calclone
```

### 2. Setup Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cal_clone
FRONTEND_URL=http://localhost:3000
```
Run the database schema:
*   Open `server/schema.sql`
*   Run the SQL commands in your MySQL Workbench/Terminal to create tables.

Start the server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
```
Start the frontend:
```bash
npm run dev
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/event-types` | List all event types |
| `POST` | `/api/event-types` | Create a new event type |
| `GET` | `/api/availability` | Get user schedule & timezone |
| `POST` | `/api/availability` | Update schedule & timezone |
| `GET` | `/api/bookings` | List all bookings |
| `POST` | `/api/bookings` | Create a new booking |
| `DELETE` | `/api/bookings/:id` | Cancel a booking |

## 🚀 Deployment

This project is deployed using a "Best of Breed" strategy:
*   **Frontend**: [Vercel](https://vercel.com)
*   **Backend**: [Render](https://render.com)
*   **Database**: [TiDB Cloud](https://tidbcloud.com)

**Note**: For SPA routing to work on Vercel, a `vercel.json` file is included in the `client` directory.
