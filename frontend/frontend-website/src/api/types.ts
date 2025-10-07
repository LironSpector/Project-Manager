// Shared TypeScript types for API requests and responses, including ProblemDetails from ASP.NET Core.

export type AuthResponse = {
    token: string;
    expiresAtUtc: string; // ISO string
    email: string;
    userId: string;
    // these 2 fields are present only when the backend returns the refresh token in the JSON response (meaning non-cookie mode - so if not using cookies):
    refreshToken?: string | null;
    refreshTokenExpiresAtUtc?: string | null;
};

export type RegisterRequest = { email: string; password: string };
export type LoginRequest = { email: string; password: string };

export type ProjectResponse = {
    id: string;
    title: string;
    description?: string | null;
    creationDateUtc: string;
};

export type CreateProjectRequest = {
    title: string;
    description?: string | null;
};

export type TaskResponse = {
    id: string;
    title: string;
    dueDateUtc?: string | null;
    isCompleted: boolean;
    projectId: string;
};

export type CreateTaskRequest = {
    title: string;
    dueDateUtc?: string | null;
};

export type UpdateTaskRequest = {
    title?: string | null;
    dueDateUtc?: string | null;
    clearDueDate?: boolean | null;
    isCompleted?: boolean | null;
};

// ProblemDetails shape (ASP.NET)
export type ProblemDetails = {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
    errors?: Record<string, string[]>;
};
