// Task creation form: collects title and optional due date, then calls onCreate.

import { type FormEvent, useState } from "react";
import styles from "./TaskForm.module.css";

type Props = {
    onCreate: (title: string, dueDateIso: string | null) => Promise<void> | void;
    pending?: boolean;
};

export default function TaskForm({ onCreate, pending }: Props) {
    // Local state for the new task fields.
    const [title, setTitle] = useState("");
    const [due, setDue] = useState<string>("");

    /** Handles submit, validates title, converts local datetime to ISO, and resets fields. */
    async function submit(e: FormEvent) {
        e.preventDefault();
        if (!title.trim()) return alert("Title is required");
        await onCreate(title.trim(), due ? new Date(due).toISOString() : null);
        setTitle("");
        setDue("");
    }

    return (
        <form onSubmit={submit} className={styles.form}>
            <input
                className={styles.titleInput}
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={1}
                maxLength={200}
            />
            <input
                className={styles.datetime}
                type="datetime-local"
                value={due}
                onChange={(e) => setDue(e.target.value)}
            />
            <button className={styles.submit} disabled={pending} type="submit">
                {pending ? "..." : "Add Task"}
            </button>
        </form>
    );
}
