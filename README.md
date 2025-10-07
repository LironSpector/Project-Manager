\# Project Manager System



Repository with:

\- `backend/` — ASP.NET Core 8 API + SQLite + JWT

\- `frontend/` — React + TypeScript + Vite



\## Prerequisites

\- .NET 8 SDK (run `dotnet --version` to check)

\- Node.js (20) and npm 10+

\- (Recommended): Visual Studio 2022 for the C# server (backend), and VS Code for the frontend



\## 1) Backend: restore, migrate, run

```bash

cd backend/src/ProjectManager.Api/ProjectManager.Api



\# Restore NuGet packages

dotnet restore



\# Install EF tooling once if you don't have it

dotnet tool update -g dotnet-ef



\# Apply migrations and create the local SQLite DB (App\_Data/app.db)

dotnet ef database update



\# Run the API (defaults to http://localhost:5000)

dotnet run



