import { useState, useEffect } from "react";
import API from "./api";
import Login from "./pages/Login";
import Register from "./pages/Register";

const priorities = ["Low", "Medium", "High"];
const priorityColors = {
  Low:    { bg: "#dcfce7", text: "#15803d", border: "#86efac" },
  Medium: { bg: "#fff3e3", text: "#9a3412", border: "#fed7aa" },
  High:   { bg: "#ffe4e4", text: "#b91c1c", border: "#fecaca" },
};

export default function App() {

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [showRegister, setShowRegister]   = useState(false);
  const [todos, setTodos]                 = useState([]);
  const [input, setInput]                 = useState("");
  const [priority, setPriority]           = useState("Medium");
  const [filter, setFilter]               = useState("All");
  const [searchTerm, setSearchTerm]       = useState("");
  const [sortBy, setSortBy]               = useState("date");
  const [loading, setLoading]             = useState(true);
  const [isAdding, setIsAdding]           = useState(false);
  const [isLoggingOut, setIsLoggingOut]   = useState(false); // ← NEW
  const [deletingId, setDeletingId]       = useState(null);  // ← NEW
  const [togglingId, setTogglingId]       = useState(null);  // ← NEW
  const [error, setError]                 = useState("");
  const [initialLoad, setInitialLoad]     = useState(true);

  useEffect(() => {
    if (user) fetchTodos();
    const timer = setTimeout(() => setInitialLoad(false), 1500);
    return () => clearTimeout(timer);
  }, [user]);

  const handleAuth = (data) => {
    const userData = { name: data.name, email: data.email };
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", data.token);
    setUser(userData);
    setInitialLoad(true);
    setTimeout(() => setInitialLoad(false), 1500);
  };

  // ── Logout with loading ──
  const logout = async () => {
    setIsLoggingOut(true);
    await new Promise((r) => setTimeout(r, 1200)); // smooth delay
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTodos([]);
    setError("");
    setIsLoggingOut(false);
  };

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await API.get("/todos");
      setTodos(res.data);
    } catch (err) {
      if (err.response?.status === 401) logout();
      else setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!input.trim()) { setError("Please enter a task"); return; }
    setIsAdding(true);
    try {
      const res = await API.post("/todos", { text: input.trim(), priority });
      setTodos([res.data, ...todos]);
      setInput("");
      setError("");
    } catch (err) {
      setError("Failed to add task.");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTodo = async (id, completed) => {
    setTogglingId(id); // ← show spinner on this todo
    try {
      const res = await API.patch(`/todos/${id}`, { completed: !completed });
      setTodos(todos.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      setError("Failed to update task.");
    } finally {
      setTogglingId(null);
    }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    setDeletingId(id); // ← show spinner on this todo
    try {
      await API.delete(`/todos/${id}`);
      setTodos(todos.filter((t) => t._id !== id));
    } catch (err) {
      setError("Failed to delete task.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return showRegister
      ? <Register onSwitch={() => setShowRegister(false)} onAuth={handleAuth} />
      : <Login    onSwitch={() => setShowRegister(true)}  onAuth={handleAuth} />;
  }

  // ── Logout loading screen ──
  if (isLoggingOut) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "16px",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          width: 52, height: 52,
          border: "4px solid rgba(255,255,255,0.3)",
          borderTopColor: "white", borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <p style={{ color: "white", fontSize: "16px", fontWeight: "500", margin: 0 }}>
          Signing you out...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Initial loading screen ──
  if (initialLoad) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 72, height: 72,
            background: "rgba(255,255,255,0.2)", borderRadius: "20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", fontSize: "36px"
          }}>✨</div>
          <h2 style={{ color: "white", fontSize: "22px", fontWeight: "600", margin: "0 0 8px" }}>
            TaskFlow
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", margin: "0 0 24px" }}>
            Welcome back, {user.name}!
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 8, height: 8, background: "white", borderRadius: "50%",
                animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`
              }} />
            ))}
          </div>
        </div>
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  const filtered = todos
    .filter((t) => {
      if (filter === "Active")    return !t.completed;
      if (filter === "Completed") return t.completed;
      return true;
    })
    .filter((t) => t.text.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "priority") {
        const order = { High: 3, Medium: 2, Low: 1 };
        return order[b.priority] - order[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const remaining = todos.filter((t) => !t.completed).length;
  const completed = todos.filter((t) => t.completed).length;
  const stats = [
    { label: "All",       value: todos.length, color: "#3b82f6", icon: "📋" },
    { label: "Active",    value: remaining,    color: "#f59e0b", icon: "⚡" },
    { label: "Completed", value: completed,    color: "#10b981", icon: "✅" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: "24px 16px"
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "28px",
          flexWrap: "wrap", gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 40, height: 40, background: "rgba(255,255,255,0.2)",
              borderRadius: "12px", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "20px"
            }}>✨</div>
            <div>
              <h1 style={{ color: "white", fontSize: "20px", fontWeight: "700", margin: 0 }}>TaskFlow</h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", margin: 0 }}>Organize your day</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "40px", padding: "6px 14px"
            }}>
              <div style={{
                width: 28, height: 28, background: "rgba(255,255,255,0.3)",
                borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "12px", fontWeight: "700"
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span style={{ color: "white", fontSize: "13px", fontWeight: "500" }}>
                {user?.name || "User"}
              </span>
            </div>

            {/* ── Logout Button ── */}
            <button onClick={logout} disabled={isLoggingOut} style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "20px", padding: "6px 16px",
              color: "white", fontSize: "13px", cursor: "pointer",
              fontFamily: "inherit", transition: "background 0.2s",
              display: "flex", alignItems: "center", gap: "6px"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
              {isLoggingOut ? (
                <>
                  <div style={{
                    width: 12, height: 12,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "white", borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }} />
                  Signing out...
                </>
              ) : "Sign Out"}
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px", marginBottom: "24px"
        }}>
          {stats.map((stat, idx) => (
            <div key={idx} onClick={() => setFilter(stat.label)} style={{
              background: "white", borderRadius: "14px", padding: "14px 16px",
              cursor: "pointer",
              border: filter === stat.label ? `2px solid ${stat.color}` : "2px solid transparent",
              transition: "transform 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "22px" }}>{stat.icon}</span>
                <span style={{ fontSize: "24px", fontWeight: "700", color: stat.color }}>{stat.value}</span>
              </div>
              <div style={{ fontSize: "12px", fontWeight: "500", color: "#6b7280" }}>{stat.label} Tasks</div>
            </div>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: "#fee2e2", color: "#991b1b", borderRadius: "10px",
            padding: "10px 16px", marginBottom: "16px", fontSize: "13px",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#991b1b" }}>×</button>
          </div>
        )}

        {/* ── Add Task ── */}
        <div style={{
          background: "white", borderRadius: "16px", padding: "16px",
          marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
            <input
              style={{
                flex: 1, padding: "10px 14px", border: "1.5px solid #e5e7eb",
                borderRadius: "12px", fontSize: "14px", outline: "none",
                fontFamily: "inherit", color: "#1f2937", minWidth: "200px"
              }}
              placeholder="Add a new task..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTodo(); } }}
              onFocus={e => e.target.style.borderColor = "#667eea"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
            <button onClick={addTodo} disabled={isAdding} style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white", border: "none", borderRadius: "12px",
              padding: "10px 22px", fontSize: "14px", fontWeight: "600",
              cursor: isAdding ? "not-allowed" : "pointer",
              fontFamily: "inherit", display: "flex",
              alignItems: "center", gap: "6px",
              opacity: isAdding ? 0.8 : 1
            }}>
              {isAdding ? (
                <>
                  <div style={{
                    width: 14, height: 14,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "white", borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }} />
                  Adding...
                </>
              ) : "+ Add"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {priorities.map((p) => (
              <button key={p} onClick={() => setPriority(p)} style={{
                padding: "5px 14px", borderRadius: "20px", fontSize: "12px",
                fontWeight: "500", cursor: "pointer", fontFamily: "inherit",
                border: `1.5px solid ${priority === p ? priorityColors[p].border : "#e5e7eb"}`,
                background: priority === p ? priorityColors[p].bg : "white",
                color: priority === p ? priorityColors[p].text : "#6b7280",
                transition: "all 0.2s"
              }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ── Controls ── */}
        <div style={{
          display: "flex", gap: "12px", marginBottom: "16px",
          flexWrap: "wrap", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{
            display: "flex", gap: "4px", background: "white",
            padding: "4px", borderRadius: "10px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            {["All", "Active", "Completed"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "6px 16px", borderRadius: "8px", border: "none",
                cursor: "pointer", fontFamily: "inherit",
                background: filter === f ? "#667eea" : "transparent",
                color: filter === f ? "white" : "#4b5563",
                fontWeight: "500", fontSize: "13px", transition: "all 0.2s"
              }}>
                {f}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: "10px", top: "50%",
                transform: "translateY(-50%)", fontSize: "12px", color: "#9ca3af"
              }}>🔍</span>
              <input
                type="text" placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "7px 10px 7px 30px", borderRadius: "20px",
                  border: "1.5px solid #e5e7eb", background: "white",
                  fontSize: "13px", outline: "none", color: "#1f2937",
                  width: "140px", fontFamily: "inherit"
                }}
                onFocus={e => e.target.style.borderColor = "#667eea"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{
              padding: "7px 12px", borderRadius: "20px",
              border: "1.5px solid #e5e7eb", background: "white",
              fontSize: "12px", cursor: "pointer",
              color: "#1f2937", outline: "none", fontFamily: "inherit"
            }}>
              <option value="date">📅 Date</option>
              <option value="priority">🎯 Priority</option>
            </select>
          </div>
        </div>

        {/* ── Todo List ── */}
        {loading ? (
          <div style={{
            textAlign: "center", padding: "48px", background: "white",
            borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <div style={{
              width: 36, height: 36,
              border: "3px solid #e5e7eb", borderTopColor: "#667eea",
              borderRadius: "50%", animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px"
            }} />
            <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Loading your tasks...</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "48px", background: "white",
                borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
              }}>
                <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>🎯</span>
                <h3 style={{ margin: "0 0 6px", color: "#374151", fontSize: "16px", fontWeight: "600" }}>No tasks found</h3>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
                  {searchTerm ? "Try a different search" : "Add your first task above!"}
                </p>
              </div>
            ) : (
              filtered.map((todo) => (
                <div key={todo._id} style={{
                  background: "white", borderRadius: "12px",
                  padding: "12px 16px", display: "flex",
                  alignItems: "center", gap: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.2s",
                  opacity: deletingId === todo._id ? 0.5 : 1
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateX(3px)";
                  e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                }}>

                  {/* Checkbox with spinner */}
                  <button onClick={() => toggleTodo(todo._id, todo.completed)}
                    disabled={togglingId === todo._id}
                    style={{
                      width: 20, height: 20, borderRadius: "6px", flexShrink: 0,
                      border: `1.5px solid ${todo.completed ? "#10b981" : "#d1d5db"}`,
                      background: todo.completed ? "#10b981" : "white",
                      cursor: togglingId === todo._id ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", transition: "all 0.2s"
                    }}>
                    {togglingId === todo._id ? (
                      <div style={{
                        width: 10, height: 10,
                        border: "1.5px solid #d1d5db",
                        borderTopColor: "#667eea", borderRadius: "50%",
                        animation: "spin 0.8s linear infinite"
                      }} />
                    ) : todo.completed ? (
                      <span style={{ color: "white", fontSize: "11px", fontWeight: "bold" }}>✓</span>
                    ) : null}
                  </button>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "14px", fontWeight: "500", wordBreak: "break-word",
                      color: todo.completed ? "#9ca3af" : "#1f2937",
                      textDecoration: todo.completed ? "line-through" : "none"
                    }}>
                      {todo.text}
                    </div>
                    {todo.createdAt && (
                      <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                        {new Date(todo.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric"
                        })}
                      </div>
                    )}
                  </div>

                  {/* Priority */}
                  <span style={{
                    padding: "3px 10px", borderRadius: "16px",
                    fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap",
                    background: priorityColors[todo.priority].bg,
                    color: priorityColors[todo.priority].text
                  }}>
                    {todo.priority}
                  </span>

                  {/* Delete with spinner */}
                  <button onClick={() => deleteTodo(todo._id)}
                    disabled={deletingId === todo._id}
                    style={{
                      background: "none", border: "none", fontSize: "16px",
                      cursor: deletingId === todo._id ? "not-allowed" : "pointer",
                      color: "#d1d5db", padding: "4px",
                      borderRadius: "6px", transition: "all 0.2s",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 28, height: 28
                    }}
                    onMouseEnter={e => {
                      if (deletingId !== todo._id) {
                        e.currentTarget.style.color = "#ef4444";
                        e.currentTarget.style.background = "#fee2e2";
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = "#d1d5db";
                      e.currentTarget.style.background = "none";
                    }}>
                    {deletingId === todo._id ? (
                      <div style={{
                        width: 12, height: 12,
                        border: "2px solid #d1d5db",
                        borderTopColor: "#ef4444", borderRadius: "50%",
                        animation: "spin 0.8s linear infinite"
                      }} />
                    ) : "🗑️"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}