// Project creation form: collects title/description and delegates submit to parent.

import { type FormEvent } from "react";
import styles from "./ProjectForm.module.css";

type Props = {
    title: string;
    desc: string;
    onChangeTitle: (v: string) => void;
    onChangeDesc: (v: string) => void;
    onSubmit: (e: FormEvent) => void;
    pending: boolean;
    isError: boolean;
};

export default function ProjectForm({
    title,
    desc,
    onChangeTitle,
    onChangeDesc,
    onSubmit,
    pending,
    isError,
}: Props) {
    /** Renders a controlled form and calls the provided onSubmit handler. */
    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <h3>Create Project</h3>
            <div className={styles.field}>
                <input
                    placeholder="Title (3–100 characters)"
                    value={title}
                    onChange={(e) => onChangeTitle(e.target.value)}
                    required
                    minLength={3}
                    maxLength={100}
                />
            </div>
            <div className={styles.field}>
                <textarea
                    placeholder="Description (optional, up to 500 characters)"
                    value={desc}
                    onChange={(e) => onChangeDesc(e.target.value)}
                    maxLength={500}
                />
            </div>
            <div className={styles.actions}>
                <button disabled={pending} type="submit">
                    {pending ? "..." : "Create"}
                </button>
            </div>
            {isError && <div className={styles.error}>Failed to create project</div>}
        </form>
    );
}
