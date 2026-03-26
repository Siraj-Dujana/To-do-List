import { useState, useEffect } from "react";
import API from "./api";

const priorities = ["Low", "Medium", "High"];
const priorityColors = {
  Low: { bg: "#dcfce7", text: "#15803d", border: "#86efac" },
  Medium: { bg: "#fff3e3", text: "#9a3412", border: "#fed7aa" },
  High: { bg: "#ffe4e4", text: "#b91c1c", border: "#fecaca" }
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [isAdding, setIsAdding] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetchTodos();
    // Simulate minimum loading time for better UX
    setTimeout(() => {
      setInitialLoad(false);
    }, 2000);
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await API.get("/todos");
      setTodos(res.data);
    } catch (err) {
      setError("Unable to connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!input.trim()) {
      setError("Please enter a task description");
      return;
    }
    
    setIsAdding(true);
    try {
      const res = await API.post("/todos", { 
        text: input.trim(), 
        priority,
        createdAt: new Date().toISOString()
      });
      setTodos([res.data, ...todos]);
      setInput("");
      setError("");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const res = await API.patch(`/todos/${id}`, { completed: !completed });
      setTodos(todos.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      setError("Failed to update task status.");
    }
  };

  const deleteTodo = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await API.delete(`/todos/${id}`);
        setTodos(todos.filter((t) => t._id !== id));
      } catch (err) {
        setError("Failed to delete task.");
      }
    }
  };

  const filtered = todos
    .filter((t) => {
      if (filter === "Active") return !t.completed;
      if (filter === "Completed") return t.completed;
      return true;
    })
    .filter((t) => 
      t.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  const remaining = todos.filter((t) => !t.completed).length;
  const completed = todos.filter((t) => t.completed).length;

  const stats = [
    { label: "All", value: todos.length, color: "#3b82f6", icon: "📋" },
    { label: "Active", value: remaining, color: "#f59e0b", icon: "⚡" },
    { label: "Completed", value: completed, color: "#10b981", icon: "✅" }
  ];

  // Loading screen component
  if (initialLoad) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        <div style={{
          textAlign: "center",
          animation: "fadeInUp 0.5s ease-out"
        }}>
          {/* Animated Logo */}
          <div style={{
            width: "80px",
            height: "80px",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            animation: "pulse 1.5s ease-in-out infinite"
          }}>
            <span style={{
              fontSize: "40px",
              animation: "rotate 1s ease-in-out infinite"
            }}>✨</span>
          </div>
          
          {/* Loading Text */}
          <h2 style={{
            color: "white",
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "12px",
            animation: "fadeIn 0.8s ease-out"
          }}>
            TaskFlow
          </h2>
          
          {/* Animated Dots */}
          <div style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            marginTop: "16px"
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              background: "white",
              borderRadius: "50%",
              animation: "bounce 1.4s ease-in-out infinite",
              animationDelay: "0s"
            }} />
            <div style={{
              width: "8px",
              height: "8px",
              background: "white",
              borderRadius: "50%",
              animation: "bounce 1.4s ease-in-out infinite",
              animationDelay: "0.2s"
            }} />
            <div style={{
              width: "8px",
              height: "8px",
              background: "white",
              borderRadius: "50%",
              animation: "bounce 1.4s ease-in-out infinite",
              animationDelay: "0.4s"
            }} />
          </div>
          
          <p style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: "13px",
            marginTop: "20px",
            animation: "fadeIn 1s ease-out"
          }}>
            Loading your workspace...
          </p>

          <style>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
                opacity: 1;
              }
              50% {
                transform: scale(1.05);
                opacity: 0.9;
              }
            }
            
            @keyframes rotate {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            
            @keyframes bounce {
              0%, 80%, 100% {
                transform: scale(0.6);
                opacity: 0.5;
              }
              40% {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: "24px 16px"
    }}>
      
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        animation: "fadeIn 0.5s ease-out"
      }}>
        
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "28px"
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            padding: "8px 20px",
            borderRadius: "40px",
            marginBottom: "16px"
          }}>
            <span style={{ fontSize: "24px" }}>✨</span>
            <h1 style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "white",
              margin: 0
            }}>
              Task<span style={{ fontWeight: "400" }}>Flow</span>
            </h1>
          </div>
          <p style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "13px",
            margin: 0
          }}>
            Organize your day, achieve more
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
          marginBottom: "24px"
        }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{
              background: "white",
              borderRadius: "14px",
              padding: "14px 16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              transition: "transform 0.2s",
              cursor: "pointer",
              border: filter === stat.label ? `2px solid ${stat.color}` : "2px solid transparent",
              animation: `slideUp 0.4s ease-out ${idx * 0.1}s both`
            }}
            onClick={() => setFilter(stat.label)}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px"
              }}>
                <span style={{ fontSize: "22px" }}>{stat.icon}</span>
                <span style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: stat.color
                }}>{stat.value}</span>
              </div>
              <div style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#6b7280"
              }}>{stat.label} Tasks</div>
            </div>
          ))}
        </div>

        {/* Error Toast */}
        {error && (
          <div style={{
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "10px",
            padding: "8px 16px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            animation: "slideDown 0.3s ease-out"
          }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              color: "#991b1b"
            }}>×</button>
          </div>
        )}

        {/* Add Task Card */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          animation: "slideUp 0.4s ease-out 0.2s both"
        }}>
          <div style={{
            display: "flex",
            gap: "10px",
            marginBottom: "12px",
            flexWrap: "wrap"
          }}>
            <input
              style={{
                flex: 1,
                padding: "10px 14px",
                border: "1.5px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                outline: "none",
                fontFamily: "inherit",
                color: "#1f2937",
                backgroundColor: "white"
              }}
              placeholder="Add a new task..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              onFocus={e => e.currentTarget.style.borderColor = "#667eea"}
              onBlur={e => e.currentTarget.style.borderColor = "#e5e7eb"}
            />
            <button onClick={addTodo}
              disabled={isAdding}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: isAdding ? "not-allowed" : "pointer",
                transition: "transform 0.2s",
                opacity: isAdding ? 0.7 : 1
              }}>
              {isAdding ? "Adding..." : "+ Add"}
            </button>
          </div>
          
          <div style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap"
          }}>
            {priorities.map((p) => (
              <button key={p} onClick={() => setPriority(p)} style={{
                padding: "5px 14px",
                borderRadius: "20px",
                border: `1.5px solid ${priority === p ? priorityColors[p].border : "#e5e7eb"}`,
                background: priority === p ? priorityColors[p].bg : "white",
                color: priority === p ? priorityColors[p].text : "#6b7280",
                fontWeight: "500",
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Bar */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          animation: "slideUp 0.4s ease-out 0.3s both"
        }}>
          <div style={{
            display: "flex",
            gap: "6px",
            background: "white",
            padding: "4px",
            borderRadius: "10px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            {["All", "Active", "Completed"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "6px 18px",
                borderRadius: "8px",
                border: "none",
                background: filter === f ? "#667eea" : "transparent",
                color: filter === f ? "white" : "#4b5563",
                fontWeight: "500",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}>
                {f}
              </button>
            ))}
          </div>

          <div style={{
            display: "flex",
            gap: "10px"
          }}>
            <div style={{
              position: "relative"
            }}>
              <span style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "12px",
                color: "#9ca3af"
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "6px 10px 6px 32px",
                  borderRadius: "20px",
                  border: "1.5px solid #e5e7eb",
                  background: "white",
                  fontSize: "13px",
                  outline: "none",
                  color: "#1f2937",
                  width: "140px"
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#667eea"}
                onBlur={e => e.currentTarget.style.borderColor = "#e5e7eb"}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                border: "1.5px solid #e5e7eb",
                background: "white",
                fontSize: "12px",
                cursor: "pointer",
                color: "#1f2937",
                outline: "none"
              }}
            >
              <option value="date">📅 Date</option>
              <option value="priority">🎯 Priority</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            animation: "fadeIn 0.3s ease-out"
          }}>
            <div style={{
              width: "32px",
              height: "32px",
              border: "2px solid #e5e7eb",
              borderTopColor: "#667eea",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px"
            }} />
            <p style={{ color: "#6b7280", fontSize: "13px" }}>Loading tasks...</p>
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            {filtered.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px",
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                animation: "fadeIn 0.3s ease-out"
              }}>
                <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>🎯</span>
                <h3 style={{ margin: "0 0 6px", color: "#374151", fontSize: "16px", fontWeight: "600" }}>No tasks found</h3>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
                  {searchTerm ? "Try a different search" : "Add your first task above"}
                </p>
              </div>
            ) : (
              filtered.map((todo, index) => (
                <div key={todo._id} style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateX(2px)";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                }}>
                  
                  <button onClick={() => toggleTodo(todo._id, todo.completed)} style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "6px",
                    border: `1.5px solid ${todo.completed ? "#10b981" : "#d1d5db"}`,
                    background: todo.completed ? "#10b981" : "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {todo.completed && <span style={{ color: "white", fontSize: "11px", fontWeight: "bold" }}>✓</span>}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: todo.completed ? "#9ca3af" : "#1f2937",
                      textDecoration: todo.completed ? "line-through" : "none"
                    }}>
                      {todo.text}
                    </div>
                    {todo.createdAt && (
                      <div style={{
                        fontSize: "10px",
                        color: "#9ca3af",
                        marginTop: "2px"
                      }}>
                        {new Date(todo.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div style={{
                    padding: "3px 10px",
                    borderRadius: "16px",
                    background: priorityColors[todo.priority].bg,
                    color: priorityColors[todo.priority].text,
                    fontSize: "11px",
                    fontWeight: "600",
                    whiteSpace: "nowrap"
                  }}>
                    {todo.priority}
                  </div>

                  <button onClick={() => deleteTodo(todo._id)} style={{
                    background: "none",
                    border: "none",
                    fontSize: "16px",
                    cursor: "pointer",
                    color: "#d1d5db",
                    padding: "4px",
                    borderRadius: "6px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = "#ef4444";
                    e.currentTarget.style.background = "#fee2e2";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = "#d1d5db";
                    e.currentTarget.style.background = "none";
                  }}>
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
