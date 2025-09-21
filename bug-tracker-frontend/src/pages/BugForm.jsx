import React, { useState } from "react";

export default function BugForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await onCreate({ title, description, severity });
      setTitle("");
      setDescription("");
      setSeverity("Low");
      setMsg("Created");
      setTimeout(() => setMsg(""), 1200);
    } catch (err) {
      console.error(err);
      setMsg("Create failed");
    }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-2">
      {msg && <div className="text-sm text-green-600">{msg}</div>}
      <input
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Bug title"
        className="p-2 border rounded"
      />
      <textarea
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the bug"
        className="p-2 border rounded"
      />
      <select
        value={severity}
        onChange={(e) => setSeverity(e.target.value)}
        className="p-2 border rounded"
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
      <button className="w-36 py-2 bg-indigo-600 text-white rounded">
        Create Bug
      </button>
    </form>
  );
}
