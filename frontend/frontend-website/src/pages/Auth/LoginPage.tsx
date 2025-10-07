// Login screen: collects email/password, calls API, and shows friendly error messages.

import { type FormEvent, useState } from "react";
import { login } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { parseApiError, formatFieldErrors } from "../../api/errors";

export default function LoginPage() {
    // Navigates to the dashboard on successful login.
    const nav = useNavigate();

    // Local form state for inputs and feedback.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [fieldErrorText, setFieldErrorText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /** Handles form submit, calls the login API, and formats validation/server errors. */
    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setFieldErrorText(null);
        setLoading(true);
        try {
            await login({ email, password });
            nav("/", { replace: true });
        } catch (err: any) {
            const parsed = parseApiError(err);
            setError(parsed.message);
            setFieldErrorText(formatFieldErrors(parsed.fieldErrors));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <h1>Login</h1>
            {error && <div className={styles.error}>{error}</div>}
            {fieldErrorText && (
                <div className={styles.error}>
                    <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{fieldErrorText}</pre>
                </div>
            )}
            <div>
                <label>Email</label><br />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div>
                <label>Password</label><br />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} />
            </div>
            <button disabled={loading} type="submit">{loading ? "..." : "Login"}</button>
            <div style={{ marginTop: 8 }}>
                Don't have an account? <Link to="/register">Register</Link>
            </div>
        </form>
    );
}
