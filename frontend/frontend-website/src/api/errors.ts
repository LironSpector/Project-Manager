// Utilities to normalize API errors (ProblemDetails) into friendly messages and optional field-error text.

type FieldErrors = Record<string, string[]>;

export type ParsedApiError = {
    status?: number;
    message: string;
    fieldErrors?: FieldErrors;
};

/** Converts an Axios error with ProblemDetails into a friendly shape. */
export function parseApiError(err: any): ParsedApiError {
    // Axios error shape: response.status + response.data
    const status: number | undefined = err?.response?.status;
    const data = err?.response?.data;

    // Extract ProblemDetails fields if present.
    const title: string | undefined = data?.title;
    const detail: string | undefined = data?.detail;
    const errors: FieldErrors | undefined = data?.errors;

    // Build a human-friendly message.
    let message =
        title ||
        detail ||
        (typeof data === "string" ? data : "") ||
        "Something went wrong. Please try again.";

    // Provide clearer defaults for common cases when ProblemDetails lacks title/detail.
    if (!title && !detail) {
        if (status === 401) message = "Invalid email or password.";
        if (status === 409) message = "This email is already registered.";
        if (status === 400 && errors) message = "Please fix the highlighted fields.";
    }

    // Handle network errors where no response is present (server down, CORS, or offline).
    if (!status && !data) {
        message = navigator.onLine
            ? "Can not reach the server. Please try again."
            : "You appear to be offline. Check your connection and try again.";
    }

    return { status, message, fieldErrors: errors };
}

/** Convenience to format field errors into a single string for display under a form. */
export function formatFieldErrors(fieldErrors?: FieldErrors): string | null {
    if (!fieldErrors) return null;
    const all = Object.entries(fieldErrors).flatMap(([field, msgs]) =>
        (msgs || []).map((m) => `${field}: ${m}`)
    );
    return all.length ? all.join("\n") : null;
}
