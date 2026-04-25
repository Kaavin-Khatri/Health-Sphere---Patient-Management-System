# Health Sphere - Modern Healthcare Management System

Health Sphere is a comprehensive web-based platform designed to streamline the interaction between patients and doctors. It provides a seamless interface for booking appointments, managing medical history, and administrating user roles, all powered by real-time data synchronization.

## 🚀 Features

Health Sphere offers a robust suite of tools tailored for Patients, Doctors, and Administrators, ensuring a smooth healthcare experience for everyone. Key capabilities include:

### 🔐 Security & Authentication

- **Secure Login/Signup:** Email/Password and **Google Login** integration.
- **Password Safety:**
  - Real-time **Strength Meter** during signup and password change.
  - **Show/Hide** password toggles for better usability.
  - Strict validation (Must contain numbers & symbols).
- **Phone Validation:** Country-specific formatting and strict 10-digit validation for India (+91).
- **Banned User Handling:** Flashy, secure "Access Denied" modal for suspended accounts with direct admin contact link.

### 👤 for Patients

- **Smart Appointment Booking:**
  - **Real-time Conflict detection** prevents double-booking significantly improving reliability.
  - **Doctor Availability:** View specific slots and avoid doctors on leave.
- **Dashboard:**
  - **Upcoming Appointments:** Manage your schedule with **Edit** capability (Update Name, Reason, Gender, Address).
  - **History:** View past visits and strictly manage your timeline.
- **Profile:** Manage personal details including Username and Phone Number.

### 🩺 for Doctors

- **Dedicated Dashboard:** A focused, real-time view of daily schedules.
- **Appointment Management:**
  - **One-Click Completion:** Mark appointments as "Done" to move them to history.
  - **Patient History:** Access past records for returning patients.
- **Profile:** Set and update specialization tags.

### 🛡️ for Administrators

- **User Management:**
  - **Ban/Unban Users:** Instantly suspend access for violating users.
  - **Role Control:** Promote Patients to Doctors or Demote them.
  - **Delete Users:** Permanently remove users and their data.
- **System Overview:** Monitor total doctors, patients, and feedback ratings.

### ✨ UI/UX

- **Interactive Design:** Hover effects, pulse animations, and smooth transitions.
- **Confetti Celebration:** Fun, celebratory effects upon successful signup.
- **Toast Notifications:** Non-intrusive popups for success/error messages (replacing old alerts).
- **Feedback System:**
  - **Star Ratings:** Interactive 1-5 star rating system.
  - **Review Management:** Create, Edit, and Delete your own reviews.
  - **Verification:** Doctors can verify authentic feedback, displaying a "Verified" badge.
  - **Dynamic Averaging:** Real-time calculation of the overall community rating.
- **Global Settings:** Unified "Account Settings" modal access across all pages for seamless profile management (Change Password, Delete Account).
- **Branding:** Custom SVG Favicon (Heart with Pulse) for professional and consistent branding.
- **Contact & Location:** Integrated Google Maps and animated contact details.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Bootstrap 5 (Responsive Layouts, Modals, Utilities) + Custom CSS
- **Backend / Database:** Google Firebase (Firestore)
- **Authentication:** Firebase Authentication (Email/Password & Google Auth)
- **Icons:** Bootstrap Icons
- **Fonts:** Google Fonts (Outfit)
- **Libraries:** `canvas-confetti` (Visual Effects)

## 📂 Project Structure

```
Health_Sphere/
├── public/
│   ├── css/
│   │   └── style.css       # Custom styling
│   ├── js/
│   │   └── main.js         # Core application logic (Auth, DB, UI)
│   ├── index.html          # Main landing page & App container
│   ├── about.html          # About Us page
│   ├── contact.html        # Contact page with integrated Map
│   ├── dashboard.html      # (Legacy/Fallback) Doctor Dashboard
│   ├── admin.html          # Admin Panel
│   └── ...
└── README.md
```

## ⚙️ Setup & Installation

### 📍 Project Location

The main application files are located in the `public` folder.

- **Path:** `LJ_SEM-3_Projects/Health_Sphere/public`

### 🚀 How to Run

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Kaavin-Khatri/LJ_SEM-3_Projects.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd LJ_SEM-3_Projects/Health_Sphere/public
    ```

    _(Important: You must be inside the `public` folder to serve the files correctly)_

3.  **Start a Local Server:**
    You need a local server to run the app properly (Firebase Auth requires it).

    _Option A: Using Pycathon (Recommended)_

    ```bash
    python -m http.server 8000
    ```

    _Option B: Using Node.js (http-server)_

    ```bash
    npx http-server .
    ```

4.  **Access the Application:**
    Open your web browser and go to:
    [http://localhost:8000](http://localhost:8000)

## 🔐 Credentials & Roles

The system is open for registration. New users default to the **Patient** role.

- **To become a Doctor:** Ask an Admin to promote your account.
- **To become an Admin:** (Requires manual database update or pre-configured admin account).

## 📄 Pages Overview

- **Home (`index.html`):** The central hub. Contains the Hero section, Services, and dynamically renders the Patient or Doctor dashboard based on login state.
- **About Us (`about.html`):** Company mission, statistics, and values.
- **Contact Us (`contact.html`):** Contact form and an embedded Google Map for location.
- **Admin Panel (`admin.html`):** Restricted area for user management.

---

_Developed by Kaavin Khatri,Daksh Dodiya and Parth Vekariya_
