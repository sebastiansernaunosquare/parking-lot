# Parking lot - Residential Parking Allocation System

**Parking lot** is an application designed to manage fair parking spot allocation in residential buildings with limited space. It features a robust **Raffle System** that randomly assigns spots to registered residents when demand exceeds supply.

Built with **Angular 20+** and **Bootstrap 5**, utilizing a "Thick Client" architecture with a mock REST backend.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Design Decisions](#-architecture--design-decisions)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Test Credentials](#-test-credentials)
- [Project Structure](#-project-structure)

---

## ✨ Key Features

### 🏢 Admin Dashboard

- **KPI Monitoring:** Real-time view of raffle status, available spots
- **User Management:** CRUD operations for Residents (Create, Read, Update, Delete) with modal forms.
- **Raffle Control:** Ability to create new raffle periods (e.g., "Q1 2025") and manually trigger the randomization algorithm.
- **Algorithm Execution:** Validates participant counts and executes shuffle to assign winners.

### 🏠 Resident Portal

- **Dashboard:** style cards showing current lottery status.
- **Registration:** One-click registration for the active raffle period.
- **History:** Timeline view of previous assignments (Won/Lost/Pending).

---

## 🛠 Tech Stack

- **Framework:** Angular 20+ (Standalone Components).
- **Language:** TypeScript 5.
- **State Management:** **Angular Signals** (`signal`, `computed`, `toSignal`) & RxJS.
- **Styling:** Bootstrap 5.3 (Native via CSS/JS imports, no external wrappers).
- **Backend:** `json-server` (Mock REST API).
- **Testing:** Jasmine/Karma (Unit).

---

## 💡 Architecture & Design Decisions

### 1. Logic & Mock Backend

Since we are using `json-server` (which provides a standard REST API but no server-side logic), the business logic is implemented in the **Angular Services**.

- **Raffle Algorithm:** The `RaffleService` fetches all registrations, performs a **shuffle** in the browser, slices the array based on available spots, and performs batch updates (via `forkJoin`) to the database.

### 2. Feature-Based Structure

The app is organized by domain rather than file type to ensure scalability:

- `features/admin`: All admin logic, dashboards, and management tables.
- `features/resident`: Portal logic and history views.
- `core`: Global singletons (AuthService, RaffleService, Models).

### 3. Functional Guards

Routing security is handled by modern functional guards (`CanActivateFn`) to protect `/admin` and `/portal` routes based on the user's role in `db.json`.

---

## 📦 Prerequisites

Ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Angular CLI** (`npm install -g @angular/cli`)

---

## 🚀 Installation & Setup

1.  **Clone the repository**

    ```bash
    git clone repository
    cd parking-lot
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Install JSON Server (Global)**
    Required to run the mock database.
    ```bash
    npm install -g json-server
    ```

---

## ▶️ Running the Application

To run the app, you need **two terminal instances** running simultaneously.

### Terminal 1: Mock Database

This starts the REST API on port 3000.

```bash
npm run server
```

### Terminal 2: Angular Frontend

This starts the web server on port 4200 serve

```bash
npm start
```

Open your browser to: http://localhost:4200

🔑 Test Credentials

The db.json file comes pre-populated with these users for testing
| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| Administrator | `admin@edificio.com` | `123` | Full access to Dashboard & Raffle controls. |
| Resident | `juan@gmail.com` | `123` | Access to Resident Portal & Registration. |

📂 Project Structure

```
src/
├── app/
│ ├── core/ # Global Services & Models
│ │ ├── auth/ # AuthService & Guards
│ │ ├── models/ # User, Raffle, Registration interfaces
│ │ └── services/ # UserService, RaffleService (Logic lives here)
│ │
│ ├── features/ # Feature Modules
│ │ ├── admin/ # Admin Domain
│ │ │ └── dashboard/ # Admin Dashboard Page
│ │ │
│ │ ├── resident/ # Resident Domain
│ │ │ └── portal/ # Resident Dashboard Page
│ │ │
│ │ └── auth/ # Login Page
│ │
│ └── shared/ # Reusable UI
│ └── components/ # Header (Dynamic Navbar)
│
└── db.json # The Mock Database
```