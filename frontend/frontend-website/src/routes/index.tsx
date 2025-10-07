// Declares the app's route tree: public auth pages and protected app pages under the App layout.

import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ProjectPage from "../pages/Project/ProjectPage";

// Creates the browser router with a layout route (App) and nested child routes.
export const router = createBrowserRouter([
    {
        element: <App />,
        children: [
            // Public routes
            { path: "/login", element: <LoginPage /> },
            { path: "/register", element: <RegisterPage /> },

            // Protected routes (require a valid token)
            {
                element: <ProtectedRoute />,
                children: [
                    { path: "/", element: <DashboardPage /> },
                    { path: "/projects/:id", element: <ProjectPage /> },
                ],
            },
        ],
    },
]);
