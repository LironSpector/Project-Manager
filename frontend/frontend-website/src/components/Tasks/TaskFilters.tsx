// Compact control bar for filtering and sorting tasks (status, due window, sort order).

import { useId } from "react";

export type TaskFilterState = {
    status: "all" | "open" | "completed";
    due: "all" | "overdue" | "today" | "week" | "none";
    sort: "dueAsc" | "dueDesc" | "titleAsc" | "titleDesc";
};

type Props = {
    value: TaskFilterState;
    onChange: (next: TaskFilterState) => void;
};

export default function TaskFilters({ value, onChange }: Props) {
    // Unique ids for label → input associations.
    const idStatus = useId();
    const idDue = useId();
    const idSort = useId();

    /** Updates a single field in the filter state while keeping others unchanged. */
    function update<K extends keyof TaskFilterState>(k: K, v: TaskFilterState[K]) {
        onChange({ ...value, [k]: v });
    }

    return (
        <div
            style={{
                display: "grid",
                gap: "0.5rem",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            }}
        >
            <label htmlFor={idStatus}>
                <div><small>Status</small></div>
                <select
                    id={idStatus}
                    value={value.status}
                    onChange={(e) => update("status", e.target.value as TaskFilterState["status"])}
                >
                    <option value="all">All</option>
                    <option value="open">Open</option>
                    <option value="completed">Completed</option>
                </select>
            </label>

            <label htmlFor={idDue}>
                <div><small>Due</small></div>
                <select
                    id={idDue}
                    value={value.due}
                    onChange={(e) => update("due", e.target.value as TaskFilterState["due"])}
                >
                    <option value="all">All</option>
                    <option value="overdue">Overdue</option>
                    <option value="today">Due today</option>
                    <option value="week">Due this week</option>
                    <option value="none">No due date</option>
                </select>
            </label>

            <label htmlFor={idSort}>
                <div><small>Sort</small></div>
                <select
                    id={idSort}
                    value={value.sort}
                    onChange={(e) => update("sort", e.target.value as TaskFilterState["sort"])}
                >
                    <option value="dueAsc">Due date ↑</option>
                    <option value="dueDesc">Due date ↓</option>
                    <option value="titleAsc">Title A→Z</option>
                    <option value="titleDesc">Title Z→A</option>
                </select>
            </label>
        </div>
    );
}
