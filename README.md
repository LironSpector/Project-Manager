# Project Manager — Backend + Frontend (+ How to run it - IMPORTANT)

## About the project
This is a Full-Stack complete project management app.  
**Backend:** ASP.NET Core 8 + EF Core (SQLite), JWT, clean routing, layered architecture, validation, CORS and more.  
**Frontend:** React + TypeScript (with Vite) with React Query, protected routes, projects and tasks UI (create/read/update/delete), task filtering/sorting, error handling, and more.  


This project is a Repository with two apps (server and website - client):
The high-level folder structure which is relevant for the configuration part is:
```
Project Manager System/
├─ backend/
│  └─ src/
│     └─ ProjectManager.Api/
│        ├─ ProjectManager.Api.sln
│        └─ ProjectManager.Api/
│           ├─ Program.cs
│           ├─ ProjectManager.Api.csproj
│           ├─ Migrations/
│           ├─ App_Data/ # SQLite DB lives here (not in the GitHub repository - instructions later in this file)
│           └─ ...(more)
└─ frontend/
   └─ frontend-website/
      ├─ package.json
      ├─ package-lock.json
      ├─ src/
      └─ ...(more)
```

The API listens on **http://localhost:5000** and the website app is on **http://localhost:5173**.

# The following are the rules for how to clone and run the project successfully - follow these:
---

## 0) Install prerequisites

### 0.1 .NET SDK 8.x (.NET 9 could also work, but 8 is preferred)
- Install **.NET SDK 8.x** (not just the runtime).

### 0.2 Node.js LTS + npm
- Install **Node.js LTS 20.x** (includes npm 10+).

---

## 1) Clone the repository

```bash
git clone https://github.com/LironSpector/Project-Manager.git
cd "<into the project>"
```

---

## 2) Backend: restore, migrate, run

Open a terminal and navigate to:

```bash
cd backend/src/ProjectManager.Api/ProjectManager.Api
```

### 2.1 Restore and build
```bash
dotnet restore
dotnet build
```

### 2.2 Ensure the SQLite folder exists
The DB file is `./App_Data/app.db`. You need to create only the "App_Data" folder - not the app.db file:

```bash
# In the folder in which Program.cs, Migrations and so on are present, run this command to create the App_Data folder (it will be next to Migrations and so on):
mkdir .\App_Data
```

### 2.3 Apply EF Core migrations
**Using the terminal (CLI) - in the same directory (the one which contains the Migrations folder for example):**
```bash
dotnet tool install -g dotnet-ef # installs EF CLI globally (if not already installed)
dotnet ef database update # applies migrations to App_Data/app.db
```

### 2.4 Run the API (the server)
```bash
dotnet run
```
You should see:
```
Now listening on: http://localhost:5000
```
If you see this, it means the C# server is running successfully

---

## 3) Frontend: install, configure, run

Open a **second** terminal:

```bash
cd frontend/frontend-website
```

### 3.1 Install dependencies with the lockfile
Use `npm ci` (this gives the exact versions for dependencies from `package-lock.json`):
```bash
npm ci
```

### 3.2 Configure environment
Copy the .env.example file to a new file .env.local which this command will create:
```bash
cp .env.example .env.local

```

Edit the values in `.env.local` to these values:
```
VITE_API_BASE_URL=http://localhost:5000
VITE_USE_COOKIE_REFRESH=false
```

### 3.3 Run the dev server
```bash
npm run dev
```
If succeeded - you ran the website successfully - visit **http://localhost:5173** to view the website and perform operations as you would like.

---
