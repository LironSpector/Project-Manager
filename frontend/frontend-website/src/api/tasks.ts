// Client helpers for task endpoints: list, create, update, delete for a project's tasks.

import { http } from "./http";
import type { CreateTaskRequest, TaskResponse, UpdateTaskRequest } from "./types";

/** Lists tasks for a project. */
export async function listTasks(projectId: string) {
    const { data } = await http.get<TaskResponse[]>(`/api/projects/${projectId}/tasks`);
    return data;
}

/** Creates a task in a specific project. */
export async function createTask(projectId: string, payload: CreateTaskRequest) {
    const { data } = await http.post<TaskResponse>(`/api/projects/${projectId}/tasks`, payload);
    return data;
}

/** Updates a task by id (title, due date, completion, or clear due date). */
export async function updateTask(taskId: string, payload: UpdateTaskRequest) {
    const { data } = await http.put<TaskResponse>(`/api/tasks/${taskId}`, payload);
    return data;
}

/** Deletes a task by id. */
export async function deleteTask(taskId: string) {
    await http.delete(`/api/tasks/${taskId}`);
}
