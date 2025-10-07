// Bootstraps the React application: mounts the app, provides React Query and Router providers, and loads global styles.

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "./routes";
import { queryClient } from "./lib/queryClient";

import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/globals.css";

// Note: these are the dependencies installed for this project to work (the terminal command):
// npm i axios @tanstack/react-query react-router-dom zustand

// Additional general note: currenlty I don't use cookies, but I began to develop the mechanism of using cookies instead of storing the refresh token in local storage (in addition to the access token)

// Mount the app into #root and wrap with React Query + Router providers.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);