// A single task row with title editing, due date editing, completion toggle, and delete.

import type { TaskResponse } from "../../api/types";
import { useState } from "react";
import styles from "./TaskItem.module.css";

type Props = {
    task: TaskResponse;
    onToggleComplete: (taskId: string, next: boolean) => Promise<void> | void;
    onSaveDueDate: (taskId: string, iso: string | null) => Promise<void> | void;
    onRename: (taskId: string, title: string) => Promise<void> | void;
    onDelete: (taskId: string) => Promise<void> | void;
    pending?: boolean;
};

export default function TaskItem({ task, onToggleComplete, onSaveDueDate, onRename, onDelete, pending }: Props) {
    // Local edit state for title and due date input.
    const [editingTitle, setEditingTitle] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [due, setDue] = useState(task.dueDateUtc ? toLocalInput(task.dueDateUtc) : "");

    /** Converts an ISO string to a yyyy-MM-ddTHH:mm string for datetime-local input. */
    function toLocalInput(iso: string) {
        const d = new Date(iso);
        const pad = (n: number) => (n < 10 ? `0${n}` : n);
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const mi = pad(d.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    }

    /** Saves the edited title via onRename and exits edit mode. */
    async function saveTitle() {
        if (!title.trim()) return;
        await onRename(task.id, title.trim());
        setEditingTitle(false);
    }

    /** Saves the edited due date (or clears it) via onSaveDueDate. */
    async function saveDue() {
        const iso = due ? new Date(due).toISOString() : null;
        await onSaveDueDate(task.id, iso);
    }

    return (
        <li className={`${styles.item} ${pending ? styles.pending : ""} ${task.isCompleted ? styles.completed : ""}`}>
            <div className={styles.topRow}>
                <label className={styles.checkbox}>
                    <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => onToggleComplete(task.id, !task.isCompleted)}
                        disabled={pending}
                    />
                </label>

                {editingTitle ? (
                    <span className={styles.inlineEdit}>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            type="text"
                        />
                        <button onClick={saveTitle} disabled={pending}>Save</button>
                        <button onClick={() => { setEditingTitle(false); setTitle(task.title); }}>Cancel</button>
                    </span>
                ) : (
                    <>
                        <strong className={styles.title}>{task.title}</strong>
                        <button className={styles["rename-task-button"]} onClick={() => setEditingTitle(true)}>Rename</button>
                    </>
                )}
            </div>

            <div className={styles.dueRow}>
                <small>Due:</small>
                <input
                    className={styles.datetime}
                    type="datetime-local"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    onBlur={saveDue}
                    disabled={pending}
                />
                <button
                    onClick={async () => { setDue(""); await onSaveDueDate(task.id, null); }}
                    className="ghost"
                >
                    Clear
                </button>
            </div>

            <div className={styles.actions}>
                <button onClick={() => onDelete(task.id)} disabled={pending} className={styles.danger}>
                    Delete
                </button>
            </div>
        </li>
    );
}
