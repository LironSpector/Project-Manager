// Single project row: links to the project and exposes a delete button.

import { Link } from "react-router-dom";
import styles from "./ProjectListItem.module.css";

type Props = {
    id: string;
    title: string;
    creationDateUtc: string;
    onDelete: (id: string, title: string) => void;
    pending: boolean;
};

export default function ProjectListItem({
    id,
    title,
    creationDateUtc,
    onDelete,
    pending,
}: Props) {
    /** Calls onDelete with project id and title after user interaction. */
    return (
        <li className={styles.item}>
            <div className={styles.left}>
                <Link to={`/projects/${id}`} className={styles.title}>{title}</Link>
                <small className={styles.meta}>{new Date(creationDateUtc).toLocaleString()}</small>
            </div>
            <div className={styles.actions}>
                <button
                    onClick={() => onDelete(id, title)}
                    className={styles.danger}
                    disabled={pending}
                >
                    Delete
                </button>
            </div>
        </li>
    );
}
