// Renders a list of TaskItem components or an empty-state message.

import type { TaskResponse } from "../../api/types";
import TaskItem from "./TaskItem";
import styles from "./TaskList.module.css";

type Props = {
    tasks: TaskResponse[] | undefined;
    busyIds?: Set<string>;
    onToggleComplete: (taskId: string, next: boolean) => Promise<void> | void;
    onSaveDueDate: (taskId: string, iso: string | null) => Promise<void> | void;
    onRename: (taskId: string, title: string) => Promise<void> | void;
    onDelete: (taskId: string) => Promise<void> | void;
};

export default function TaskList({ tasks, busyIds, ...handlers }: Props) {
    /** Shows a friendly empty message when there are no tasks. */
    if (!tasks || tasks.length === 0) return <div className={styles.empty}>No tasks yet.</div>;

    /** Maps each task to a TaskItem, forwarding busy flag and handlers. */
    return (
        <ul className={styles.list}>
            {tasks.map((t) => (
                <TaskItem
                    key={t.id}
                    task={t}
                    pending={busyIds?.has(t.id)}
                    {...handlers}
                />
            ))}
        </ul>
    );
}
