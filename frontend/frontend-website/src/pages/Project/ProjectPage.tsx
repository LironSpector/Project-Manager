// Project details page: shows project info, allows creating tasks, and filters/sorts the task list.

import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProject } from "../../api/projects";
import { createTask, deleteTask, listTasks, updateTask } from "../../api/tasks";
import TaskForm from "../../components/Tasks/TaskForm";
import TaskList from "../../components/Tasks/TaskList";
import { useMemo, useState } from "react";
import styles from "./ProjectPage.module.css";
import TaskFilters, { type TaskFilterState } from "../../components/Tasks/TaskFilters";

export default function ProjectPage() {
    const { id: projectId } = useParams<{ id: string }>();
    const qc = useQueryClient();

    // Loads the current project metadata.
    const { data: project, isLoading: projLoading } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => getProject(projectId!),
        enabled: !!projectId,
    });

    // Loads all tasks for the current project.
    const { data: tasks, isLoading: tasksLoading } = useQuery({
        queryKey: ["tasks", projectId],
        queryFn: () => listTasks(projectId!),
        enabled: !!projectId,
    });

    // Tracks which task IDs are "busy" while a mutation is in flight.
    const [busy, setBusy] = useState<Set<string>>(new Set());
    const busyIds = useMemo(() => busy, [busy]);

    // Creates a task and invalidates the task list on success.
    const createMut = useMutation({
        mutationFn: (input: { title: string; dueDateIso: string | null }) =>
            createTask(projectId!, { title: input.title, dueDateUtc: input.dueDateIso || undefined }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
    });

    /** Wraps a task mutation and toggles its "busy" state for optimistic UI feedback. */
    async function wrapBusy(taskId: string, fn: () => Promise<void>) {
        setBusy((s) => new Set(s).add(taskId));
        try {
            await fn();
        } finally {
            setBusy((s) => {
                const n = new Set(s);
                n.delete(taskId);
                return n;
            });
        }
    }

    /** Creates a task with optional due date using the create mutation. */
    async function onCreate(title: string, dueDateIso: string | null) {
        await createMut.mutateAsync({ title, dueDateIso });
    }

    /** Toggles completion for a task and refetches the task list. */
    async function onToggleComplete(taskId: string, next: boolean) {
        await wrapBusy(taskId, async () => {
            await updateTask(taskId, { isCompleted: next });
            qc.invalidateQueries({ queryKey: ["tasks", projectId] });
        });
    }

    /** Saves or clears a task due date then refetches the task list. */
    async function onSaveDueDate(taskId: string, iso: string | null) {
        await wrapBusy(taskId, async () => {
            if (iso === null) await updateTask(taskId, { clearDueDate: true });
            else await updateTask(taskId, { dueDateUtc: iso });
            qc.invalidateQueries({ queryKey: ["tasks", projectId] });
        });
    }

    /** Renames a task and refetches the task list. */
    async function onRename(taskId: string, title: string) {
        await wrapBusy(taskId, async () => {
            await updateTask(taskId, { title });
            qc.invalidateQueries({ queryKey: ["tasks", projectId] });
        });
    }

    /** Deletes a task and refetches the task list. */
    async function onDelete(taskId: string) {
        if (!confirm("Delete this task?")) return;
        await wrapBusy(taskId, async () => {
            await deleteTask(taskId);
            qc.invalidateQueries({ queryKey: ["tasks", projectId] });
        });
    }

    // -----------------------------
    // Filter & Sort (client-side)
    // -----------------------------
    const [filters, setFilters] = useState<TaskFilterState>({
        status: "all",
        due: "all",
        sort: "dueAsc",
    });

    /** Returns true if two Date objects fall on the same calendar day. */
    function isSameDay(a: Date, b: Date) {
        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    }

    /** Start of week using Sunday as day 0. */
    function startOfWeek(d = new Date()) {
        const x = new Date(d);
        const day = x.getDay(); // 0..6 (Sun..Sat)
        x.setDate(x.getDate() - day);   // Sunday as day 0
        x.setHours(0, 0, 0, 0);
        return x;
    }

    /** End of the same week (Saturday 23:59:59.999). */
    function endOfWeek(d = new Date()) {
        const s = startOfWeek(d);       // Sunday
        const e = new Date(s);
        e.setDate(s.getDate() + 6);     // through Saturday
        e.setHours(23, 59, 59, 999);
        return e;
    }

    // Computes the filtered and sorted list of tasks based on current filters.
    const visibleTasks = useMemo(() => {
        if (!tasks) return [];
        const now = new Date();
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);

        let arr = tasks.filter((t) => {
            // status filter
            if (filters.status === "open" && t.isCompleted) return false;
            if (filters.status === "completed" && !t.isCompleted) return false;

            // due filter
            const due = t.dueDateUtc ? new Date(t.dueDateUtc) : null;
            switch (filters.due) {
                case "overdue":
                    if (!due || due >= now) return false;
                    break;
                case "today":
                    if (!due || !isSameDay(due, now)) return false;
                    break;
                case "week":
                    if (!due || due < weekStart || due > weekEnd) return false;
                    break;
                case "none":
                    if (due) return false;
                    break;
            }
            return true;
        });

        // Sorting helpers.
        const byTitle = (a: string, b: string) =>
            a.localeCompare(b, undefined, { sensitivity: "base" });
        const byDue = (a?: string | null, b?: string | null, asc = true) => {
            // Tasks without due date are placed at the end.
            const na = a ? new Date(a).getTime() : Number.POSITIVE_INFINITY;
            const nb = b ? new Date(b).getTime() : Number.POSITIVE_INFINITY;
            return asc ? na - nb : nb - na;
        };

        switch (filters.sort) {
            case "dueAsc":
                arr = [...arr].sort((a, b) => byDue(a.dueDateUtc, b.dueDateUtc, true));
                break;
            case "dueDesc":
                arr = [...arr].sort((a, b) => byDue(a.dueDateUtc, b.dueDateUtc, false));
                break;
            case "titleAsc":
                arr = [...arr].sort((a, b) => byTitle(a.title, b.title));
                break;
            case "titleDesc":
                arr = [...arr].sort((a, b) => byTitle(b.title, a.title));
                break;
        }
        return arr;
    }, [tasks, filters]);

    // -----------------------------

    if (!projectId) return <div>Invalid project</div>;
    if (projLoading) return <div>Loading project...</div>;
    if (!project) return <div>Not found</div>;

    return (
        <div className={styles.page}>
            <Link to="/" className={styles.back}>← Back</Link>

            <div className={styles.header}>
                <h1>{project.title}</h1>
                {project.description && <p>{project.description}</p>}
                <p className={styles.meta}>
                    <small>Created: {new Date(project.creationDateUtc).toLocaleString()}</small>
                </p>
            </div>

            <div className={styles.section}>
                <h3 className={styles["new-task-title"]}>New Task</h3>
                <TaskForm onCreate={onCreate} pending={createMut.isPending} />
            </div>

            <div className={`${styles.section} ${styles.tasksCard}`}>
                <h3>Tasks</h3>

                {/* Filter & sort controls */}
                <div style={{ margin: "0.5rem 0 1rem" }}>
                    <TaskFilters value={filters} onChange={setFilters} />
                </div>

                {tasksLoading ? (
                    <div className={styles.info}>Loading tasks...</div>
                ) : (
                    <TaskList
                        tasks={visibleTasks}
                        busyIds={busyIds}
                        onToggleComplete={onToggleComplete}
                        onSaveDueDate={onSaveDueDate}
                        onRename={onRename}
                        onDelete={onDelete}
                    />
                )}
            </div>
        </div>
    );
}
