// Dashboard page: shows project list and a form to create new projects.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProject, listProjects, deleteProject } from "../../api/projects";
import { type FormEvent, useState } from "react";
import ProjectForm from "../../components/Projects/ProjectForm";
import ProjectListItem from "../../components/Projects/ProjectListItem";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
    // React Query client to refetch lists after mutations.
    const qc = useQueryClient();

    // Loads all projects for the current user.
    const { data: projects, isLoading, error } = useQuery({
        queryKey: ["projects", "list"],
        queryFn: listProjects,
    });

    // Local form state for project creation.
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");

    // Creates a project and then invalidates the list cache.
    const createMut = useMutation({
        mutationFn: () => createProject({ title, description: desc || undefined }),
        onSuccess: () => {
            setTitle("");
            setDesc("");
            qc.invalidateQueries({ queryKey: ["projects", "list"] });
        },
    });

    // Deletes a project and then invalidates the list cache.
    const deleteMut = useMutation({
        mutationFn: (id: string) => deleteProject(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", "list"] }),
    });

    /** Validates inputs and triggers the create project mutation. */
    function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (title.trim().length < 3 || title.trim().length > 100)
            return alert("Title 3–100 chars");
        if (desc && desc.length > 500) return alert("Description must be up to 500 characters");
        createMut.mutate();
    }

    /** Confirms and triggers deletion of a project by id. */
    function handleDelete(id: string, projectTitle: string) {
        if (confirm(`Delete project "${projectTitle}"? This removes all its tasks.`)) {
            deleteMut.mutate(id);
        }
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.sectionTitle}>Dashboard</h1>

            <ProjectForm
                title={title}
                desc={desc}
                onChangeTitle={setTitle}
                onChangeDesc={setDesc}
                onSubmit={onSubmit}
                pending={createMut.isPending}
                isError={!!createMut.isError}
            />

            <h3 className={styles.sectionTitle}>Your Projects</h3>
            {isLoading && <div className={styles.info}>Loading...</div>}
            {error && <div className={styles.error}>Failed to load</div>}
            {!isLoading && projects && projects.length === 0 && <div className={styles.info}>No projects yet.</div>}

            <ul className={styles.list}>
                {projects?.map((p) => (
                    <ProjectListItem
                        key={p.id}
                        id={p.id}
                        title={p.title}
                        creationDateUtc={p.creationDateUtc}
                        onDelete={handleDelete}
                        pending={deleteMut.isPending}
                    />
                ))}
            </ul>
        </div>
    );
}
