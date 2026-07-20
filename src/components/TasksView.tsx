"use client";

import React, { useState } from "react";
import { useApp, CollaboratorTask } from "../context/AppContext";

export const TasksView: React.FC = () => {
  const { tasks, addCollaboratorTask, updateTaskStatus } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("All");

  const [title, setTitle] = useState("");
  const [role, setRole] = useState<CollaboratorTask["role"]>("Editor");
  const [status, setStatus] = useState<CollaboratorTask["status"]>("todo");
  const [videoTitle, setVideoTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !videoTitle) return;

    addCollaboratorTask({
      title,
      role,
      status,
      videoTitle,
    });

    setTitle("");
    setVideoTitle("");
    setShowAddForm(false);
  };

  const getStatusIcon = (status: CollaboratorTask["status"]) => {
    switch (status) {
      case "done":
        return <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>✓ Done</span>;
      case "in-progress":
        return <span style={{ color: "var(--accent-blue)" }}>⚙️ In Progress</span>;
      default:
        return <span style={{ color: "var(--text-muted)" }}>⏳ To Do</span>;
    }
  };

  const roles: Array<CollaboratorTask["role"] | "All"> = ["All", "Editor", "Designer", "Writer"];

  const filteredTasks = selectedRoleFilter === "All" 
    ? tasks 
    : tasks.filter(t => t.role === selectedRoleFilter);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Collaborator Tasks</h1>
          <p style={{ color: "var(--text-secondary)" }}>Manage production delegations for editors, designers, and scriptwriters.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Close Form" : "➕ Assign Task"}
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="glass-premium animate-fade-in" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>Assign New Action Item</h3>
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Task Title</label>
              <input type="text" placeholder="e.g. Cut down interview footage to 15 mins" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Video / Project Title</label>
              <input type="text" placeholder="e.g. Building Custom Water-Cooled PC Vlog" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Collaborator Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as CollaboratorTask["role"])}>
                <option value="Editor">Video Editor</option>
                <option value="Designer">Thumbnail Designer</option>
                <option value="Writer">Scriptwriter / researcher</option>
              </select>
            </div>

            <div style={{ gridColumn: "span 2", display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Assign Task</button>
            </div>
          </form>
        </div>
      )}

      {/* Filtering Tab Bar */}
      <div style={{ display: "flex", gap: "8px", background: "var(--bg-sidebar)", padding: "4px", borderRadius: "var(--radius-md)", width: "fit-content" }}>
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRoleFilter(r)}
            style={{
              padding: "8px 16px",
              background: selectedRoleFilter === r ? "var(--bg-input)" : "transparent",
              color: selectedRoleFilter === r ? "var(--text-primary)" : "var(--text-muted)",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.85rem",
              transition: "0.2s"
            }}
          >
            {r === "All" ? "All Roles" : r}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="glass-premium" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}>Task Deliverables</h3>

        {filteredTasks.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>No tasks assigned under this role filter.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filteredTasks.map((task) => (
              <div key={task.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>{task.title}</h4>
                    <span style={{ fontSize: "0.7rem", padding: "2px 8px", background: "var(--bg-sidebar)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-secondary)", textTransform: "uppercase" }}>{task.role}</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Project: <strong style={{ color: "var(--text-secondary)" }}>{task.videoTitle}</strong></p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div style={{ fontSize: "0.85rem", minWidth: "100px" }}>
                    {getStatusIcon(task.status)}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {task.status !== "todo" && (
                      <button className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: "0.75rem" }} onClick={() => updateTaskStatus(task.id, "todo")}>To Do</button>
                    )}
                    {task.status !== "in-progress" && (
                      <button className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: "0.75rem" }} onClick={() => updateTaskStatus(task.id, "in-progress")}>Progress</button>
                    )}
                    {task.status !== "done" && (
                      <button className="btn btn-success" style={{ padding: "6px 10px", fontSize: "0.75rem" }} onClick={() => updateTaskStatus(task.id, "done")}>Done</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
