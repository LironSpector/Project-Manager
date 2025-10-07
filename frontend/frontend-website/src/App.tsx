// Defines the top-level layout (header + routed content) and shows login/logout actions depending on auth state.

import { Outlet, Link, useNavigate } from "react-router-dom";
import { logout } from "./api/auth";
import { storage } from "./utils/storage";
import styles from "./App.module.css";

export default function App() {
  const navigate = useNavigate();
  const authed = !!storage.getAccessToken();

  // Triggers logout on the server, clears local tokens, and redirects to the login page.
  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  // Navigates to the login page.
  function onLogin() {
    navigate("/login");
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Link back to the dashboard */}
          <Link to="/" className={styles.brand}>Project Manager</Link>

          {/* Auth action: logout when authenticated, login otherwise */}
          <div className={styles.actions}>
            {authed ? (
              <button onClick={onLogout}>Logout</button>
            ) : (
              <button onClick={onLogin}>Login</button>
            )}
          </div>
        </div>
      </header>

      {/* Routed page content */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
