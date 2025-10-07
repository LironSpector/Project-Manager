// Client helpers for project CRUD endpoints used by the dashboard and project page.

import { http } from "./http";
import type { CreateProjectRequest, ProjectResponse } from "./types";

/** Retrieves all projects owned by the current user. */
export async function listProjects() {
    const { data } = await http.get<ProjectResponse[]>("/api/projects");
    return data;
}

/** Creates a new project with the given payload. */
export async function createProject(payload: CreateProjectRequest) {
    const { data } = await http.post<ProjectResponse>("/api/projects", payload);
    return data;
}

/** Retrieves a single project by id. */
export async function getProject(id: string) {
    const { data } = await http.get<ProjectResponse>(`/api/projects/${id}`);
    return data;
}

/** Deletes a project by id. */
export async function deleteProject(id: string) {
    await http.delete(`/api/projects/${id}`);
}
