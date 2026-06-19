# Printing Press Web Frontend

## Project Name

PrintingPress Web

## Description

This is the React frontend for the Printing Press Management System. It is used by Super Admin, Admin, and Members/Agents to manage orders, members, payments, and network hierarchy.

The frontend connects with the FastAPI backend service through REST APIs.

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React Icons
- Framer Motion

## Folder Structure

```text
ppweb/
│
├── src/
│   ├── api/
│   │   └── api.js
│   │
│   ├── Components/
│   │   └── Layout/
│   │       └── Dashboardlayout.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── Pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── Dashboards/
│   │   │   ├── SuperAdminDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── AgentDashboard.jsx
│   │   │
│   │   ├── Agents.jsx
│   │   ├── Orders.jsx
│   │   ├── AddOrder.jsx
│   │   ├── Network.jsx
│   │   ├── Payments.jsx
│   │   ├── Customers.jsx
│   │   ├── Production.jsx
│   │   ├── Reports.jsx
│   │   └── Settings.jsx
│   │
│   ├── app.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
├── vite.config.js
└── README.md