import { useState, useEffect } from "react";
import API from "./api";

const priorities = ["Low", "Medium", "High"];

export default function App() {
  const [todos, setTodos]       = useState([]);
  const [input, setInput]       = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter]     = useState("All");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await API.get("/todos");
      setTodos(res.data);
    } catch (err) {
      setError("Could not connect to server. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!input.trim()) return;
    try {
      const res = await API.post("/todos", { text: input, priority });
      setTodos([res.data, ...todos]);
      setInput("");
      setError("");
    } catch (err) {
      setError("Failed to add task.");
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const res = await API.patch(`/todos/${id}`, { completed: !completed });
      setTodos(todos.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      setError("Failed to update task.");
    }
  };

  const deleteTodo = async (id) => {
    try {
      await API.delete(`/todos/${id}`);
      setTodos(todos.filter((t) => t._id !== id));
    } catch (err) {
      setError("Failed to delete task.");
    }
  };

  const filtered = todos.filter((t) => {
    if (filter === "Active")    return !t.completed;
    if (filter === "Completed") return t.completed;
    return true;
  });

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{ height: "60px", background: "white", borderBottom: "1px solid #e0e0e0", padding: "0 24px", display: "flex", alignItems: "center", gap: "12px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ width: 36, height: 36, background: "#1a73e8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600, fontSize: 18 }}>
          T
        </div>
        <span style={{ fontSize: 20, fontWeight: 500, color: "#202124" }}>
          Task<span style={{ color: "#1a73e8" }}>Flow</span>
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ width: 36, height: 36, background: "#ea4335", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, cursor: "pointer" }}>
          U
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, width: "100%", maxWidth: "800px", margin: "0 auto", padding: "32px 20px" }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 400, color: "#202124", marginBottom: 4 }}>My Tasks</h1>
          <p style={{ fontSize: 14, color: "#5f6368" }}>
            {remaining} task{remaining !== 1 ? "s" : ""} remaining · {todos.length} total
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{ background: "#fce8e6", color: "#c5221f", borderRadius: 8, padding: "10px 16px", fontSize: 14, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {error}
            <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#c5221f", fontSize: 18 }}>×</button>
          </div>
        )}

        {/* Input Card */}
        <div style={{ background: "white", borderRadius: 16, padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 24, border: "1px solid #e0e0e0" }}>
          <input
            style={{ width: "100%", border: "none", outline: "none", fontSize: 15, color: "#202124", padding: "8px 0", background: "transparent" }}
            placeholder="Add a new task..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTodo();
              }
            }}
          />
          <div style={{ height: 1, background: "#e0e0e0", margin: "12px 0" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {priorities.map((p) => (
                <button key={p} onClick={() => setPriority(p)} style={{
                  fontSize: 13, padding: "6px 16px", borderRadius: 20,
                  border: "1px solid", cursor: "pointer",
                  borderColor: priority === p ? "transparent" : "#e0e0e0",
                  background: priority === p
                    ? p === "Low" ? "#e6f4ea" : p === "Medium" ? "#fef7e0" : "#fce8e6"
                    : "white",
                  color: priority === p
                    ? p === "Low" ? "#188038" : p === "Medium" ? "#b06000" : "#c5221f"
                    : "#5f6368",
                  fontWeight: priority === p ? 500 : 400,
                }}>
                  {p}
                </button>
              ))}
            </div>
            <button onClick={addTodo}
              style={{ background: "#1a73e8", color: "white", border: "none", borderRadius: 20, padding: "8px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#1557b0"}
              onMouseLeave={e => e.currentTarget.style.background = "#1a73e8"}>
              Add Task
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "4px", background: "#f1f3f4", padding: "4px", borderRadius: 12, width: "fit-content", marginBottom: 20 }}>
          {["All", "Active", "Completed"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              fontSize: 14, padding: "6px 16px", borderRadius: 8,
              border: "none", cursor: "pointer",
              background: filter === f ? "white" : "transparent",
              color: filter === f ? "#1a73e8" : "#5f6368",
              fontWeight: filter === f ? 500 : 400,
            }}>
              {f}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9aa0a6", fontSize: 14 }}>
            Loading tasks...
          </div>
        )}

        {/* Todo List */}
        {!loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "#9aa0a6", fontSize: 14 }}>
                No tasks here yet
              </div>
            )}
            {filtered.map((todo) => (
              <div key={todo._id}
                style={{ background: "white", border: "1px solid #e0e0e0", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = "#1a73e8"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e0e0e0"; }}
              >
                {/* Checkbox */}
                <button onClick={() => toggleTodo(todo._id, todo.completed)} style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
                  border: todo.completed ? "2px solid #1a73e8" : "2px solid #dadce0",
                  background: todo.completed ? "#1a73e8" : "white",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
                }}>
                  {todo.completed && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Text */}
                <span style={{ flex: 1, fontSize: 14, wordBreak: "break-word", color: todo.completed ? "#9aa0a6" : "#202124", textDecoration: todo.completed ? "line-through" : "none" }}>
                  {todo.text}
                </span>

                {/* Priority Badge */}
                <span style={{
                  fontSize: 11, padding: "4px 10px", borderRadius: 12, fontWeight: 500, whiteSpace: "nowrap",
                  background: todo.priority === "Low" ? "#e6f4ea" : todo.priority === "Medium" ? "#fef7e0" : "#fce8e6",
                  color: todo.priority === "Low" ? "#188038" : todo.priority === "Medium" ? "#b06000" : "#c5221f",
                }}>
                  {todo.priority}
                </span>

                {/* Delete */}
                <button onClick={() => deleteTodo(todo._id)}
                  style={{ background: "none", border: "none", fontSize: 20, lineHeight: 1, cursor: "pointer", color: "#9aa0a6", padding: "0 4px" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ea4335"}
                  onMouseLeave={e => e.currentTarget.style.color = "#9aa0a6"}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}