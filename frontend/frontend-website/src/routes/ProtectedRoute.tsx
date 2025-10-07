// Guards child routes by verifying an access token exists and has not expired; redirects to login if not valid.

import { Navigate, Outlet } from "react-router-dom";
import { storage } from "../utils/storage";

// Returns true when the expiration timestamp is missing or already passed.
function isExpired(iso?: string | null) {
    if (!iso) return true;
    const exp = new Date(iso).getTime();
    return Date.now() > exp - 5_000; // (5s)
}

export default function ProtectedRoute() {
    const token = storage.getAccessToken();
    const exp = storage.getExpiresAtUtc();

    // If there is no token or it is known to be expired, redirect to the login page.
    // The Axios interceptor will handle refresh flows when possible.
    if (!token || isExpired(exp)) {
        return <Navigate to="/login" replace />;
    }

    // Render the protected child route.
    return <Outlet />;
}
