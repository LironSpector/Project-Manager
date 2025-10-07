// Registration screen: collects email/password, calls API, handles ProblemDetails errors.

import { type FormEvent, useState } from "react";
import { register } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";
import styles from "./RegisterPage.module.css";
import { parseApiError, formatFieldErrors } from "../../api/errors";

export default function RegisterPage() {
    // Navigates to the dashboard after successful registration.
    const nav = useNavigate();

    // Local form state for inputs and feedback.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [fieldErrorText, setFieldErrorText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /** Handles form submit, calls the register API, and displays any validation errors. */
    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setFieldErrorText(null);
        setLoading(true);
        try {
            await register({ email, password });
            nav("/", { replace: true });
        } catch (err: any) {
            // Parse ASP.NET Core ProblemDetails into a friendly message + per-field text.
            const parsed = parseApiError(err);
            setError(parsed.message);
            setFieldErrorText(formatFieldErrors(parsed.fieldErrors));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <h1>Register</h1>
            {error && <div className={styles.error}>{error}</div>}
            {fieldErrorText && (
                <div className={styles.error}>
                    {/* Pre-wrap keeps line breaks for multi-field errors */}
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
            <button disabled={loading} type="submit">{loading ? "..." : "Create account"}</button>
            <div style={{ marginTop: 8 }}>
                Already have an account? <Link to="/login">Login</Link>
            </div>
        </form>
    );
}
