import { useState, useEffect } from "react";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0f1e;
    --surface: #111827;
    --surface2: #1a2235;
    --border: #1f2d45;
    --indigo: #6366f1;
    --indigo-dim: #6366f115;
    --violet: #8b5cf6;
    --emerald: #10b981;
    --emerald-dim: #10b98115;
    --orange: #f97316;
    --orange-dim: #f9731615;
    --red: #ef4444;
    --red-dim: #ef444415;
    --sky: #0ea5e9;
    --text: #e2e8f0;
    --muted: #4b5563;
    --muted2: #9ca3af;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; overflow-x: hidden; }
  input, textarea, select { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.875rem; background: var(--surface2); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 9px 13px; width: 100%; outline: none; transition: border-color 0.2s; }
  input:focus, textarea:focus, select:focus { border-color: var(--indigo); }
  select option { background: var(--surface2); }
  button { cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
  .fade { animation: fade 0.3s ease both; }
  @keyframes fade { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
`;

const fmtDate = (ts) => new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const isOverdue = (ts, status) => ts < Date.now() && status !== "Done";
const statusColor = (s) => s === "Done" ? "var(--emerald)" : s === "In Progress" ? "var(--orange)" : "var(--muted2)";
const priorityColor = (p) => p === "High" ? "var(--red)" : p === "Medium" ? "var(--orange)" : "var(--sky)";

function Avatar({ user, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: (user.color || "#6366f1") + "25",
      border: `2px solid ${user.color || "#6366f1"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.34, fontWeight: 700, color: user.color || "#6366f1", flexShrink: 0,
    }}>{user.avatar}</div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: "0.7rem", fontWeight: 600, padding: "2px 9px", borderRadius: 99,
      background: color + "20", color, border: `1px solid ${color}30`, whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function Btn({ children, onClick, variant = "primary", small, full, style: s }) {
  const v = {
    primary: { background: "var(--indigo)", color: "#fff" },
    danger:  { background: "var(--red-dim)", color: "var(--red)", border: "1px solid var(--red)30" },
    ghost:   { background: "transparent", color: "var(--muted2)", border: "1px solid var(--border)" },
    success: { background: "var(--emerald-dim)", color: "var(--emerald)", border: "1px solid var(--emerald)30" },
  };
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
      padding: small ? "6px 13px" : "9px 18px", borderRadius: 8, border: "none",
      fontSize: small ? "0.78rem" : "0.875rem", fontWeight: 600, transition: "opacity 0.15s",
      width: full ? "100%" : undefined, ...v[variant], ...s,
    }}>{children}</button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, background: "#00000088", backdropFilter: "blur(4px)",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="fade" style={{
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
        width: "100%", maxWidth: 460, padding: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted2)", fontSize: "1.2rem" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const COLORS = ["#6366f1","#10b981","#f97316","#0ea5e9","#8b5cf6","#ef4444"];

  const handle = () => {
    const stored = JSON.parse(localStorage.getItem("fd_users") || "[]");
    if (tab === "login") {
      const u = stored.find(x => x.email === email.trim() && x.pass === pass);
      if (!u) return setErr("Invalid email or password.");
      onLogin(u);
    } else {
      if (!name || !email || !pass) return setErr("Fill all fields.");
      if (stored.find(x => x.email === email.trim())) return setErr("Email already registered.");
      const initials = name.trim().split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
      const color = COLORS[stored.length % COLORS.length];
      const u = { id: Date.now(), name: name.trim(), email: email.trim(), pass, role: stored.length === 0 ? "Admin" : "Member", avatar: initials, color };
      localStorage.setItem("fd_users", JSON.stringify([...stored, u]));
      onLogin(u);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 25% 25%, #6366f112 0%, transparent 55%), radial-gradient(ellipse at 75% 75%, #10b98108 0%, transparent 55%), var(--bg)",
      padding: 16,
    }}>
      <div className="fade" style={{
        width: "100%", maxWidth: 400, background: "var(--surface)",
        border: "1px solid var(--border)", borderRadius: 18, padding: 32,
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: "var(--indigo-dim)",
            border: "2px solid var(--indigo)", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 10px", fontSize: "1.4rem",
          }}>🗂</div>
          <div style={{ fontWeight: 800, fontSize: "1.6rem", color: "var(--indigo)" }}>WorkDesk</div>
          <div style={{ color: "var(--muted2)", fontSize: "0.82rem", marginTop: 3 }}>Manage your team's work</div>
        </div>

        <div style={{ display: "flex", background: "var(--surface2)", borderRadius: 9, padding: 4, marginBottom: 20 }}>
          {["login","signup"].map(t => (
            <button key={t} onClick={() => { setTab(t); setErr(""); }} style={{
              flex: 1, padding: "7px", border: "none", borderRadius: 7, fontWeight: 600,
              fontSize: "0.85rem", background: tab===t ? "var(--indigo)" : "transparent",
              color: tab===t ? "#fff" : "var(--muted2)", cursor: "pointer", fontFamily: "Plus Jakarta Sans",
            }}>{t === "login" ? "Sign In" : "Sign Up"}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {tab === "signup" && <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />}
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={pass} onChange={e => setPass(e.target.value)} />
          {err && <div style={{ color: "var(--red)", fontSize: "0.8rem" }}>{err}</div>}
          <Btn full onClick={handle}>{tab === "login" ? "Sign In" : "Create Account"}</Btn>
          {tab === "signup" && <div style={{ color: "var(--muted2)", fontSize: "0.75rem", textAlign: "center" }}>First account gets Admin role automatically</div>}
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, user, projects, onLogout, onNewProject }) {
  const nav = [
    { id: "dashboard", icon: "⚡", label: "Dashboard" },
    { id: "projects",  icon: "📁", label: "Projects" },
    { id: "tasks",     icon: "✅", label: "My Tasks" },
    { id: "team",      icon: "👥", label: "Team" },
  ];
  if (user.role === "Admin") nav.push({ id: "admin", icon: "🛡️", label: "Admin" });

  return (
    <div style={{
      width: 220, background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, flexShrink: 0,
    }}>
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--indigo-dim)", border: "1.5px solid var(--indigo)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🗂</div>
        <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--indigo)" }}>WorkDesk</span>
      </div>

      <nav style={{ padding: "12px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
        {nav.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 8,
            border: "none", cursor: "pointer", fontFamily: "Plus Jakarta Sans", fontSize: "0.85rem",
            fontWeight: page===n.id ? 700 : 400, textAlign: "left",
            background: page===n.id ? "var(--indigo-dim)" : "transparent",
            color: page===n.id ? "var(--indigo)" : "var(--muted2)", transition: "all 0.15s",
          }}><span>{n.icon}</span>{n.label}</button>
        ))}

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 700, padding: "0 11px", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Projects</div>
          {projects.length === 0 && <div style={{ fontSize: "0.78rem", color: "var(--muted)", padding: "4px 11px" }}>No projects yet</div>}
          {projects.map(p => (
            <button key={p.id} onClick={() => setPage("projects")} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 11px", width: "100%",
              border: "none", background: "transparent", color: "var(--muted2)", cursor: "pointer",
              fontSize: "0.8rem", fontFamily: "Plus Jakarta Sans", borderRadius: 7,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
            </button>
          ))}
          {user.role === "Admin" && (
            <button onClick={onNewProject} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 11px", width: "100%",
              border: "1px dashed var(--border)", background: "transparent", color: "var(--muted)",
              cursor: "pointer", fontSize: "0.78rem", fontFamily: "Plus Jakarta Sans", borderRadius: 7, marginTop: 4,
            }}>+ New project</button>
          )}
        </div>
      </nav>

      <div style={{ padding: 10, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: 9, borderRadius: 9, background: "var(--surface2)" }}>
          <Avatar user={user} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--muted2)" }}>{user.role}</div>
          </div>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.95rem" }} title="Logout">↩</button>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardPage({ user, tasks, projects, users }) {
  const myTasks = tasks.filter(t => t.assigneeId === user.id);
  const overdue = tasks.filter(t => isOverdue(t.due, t.status));
  const stats = [
    { label: "Total Tasks", val: tasks.length, color: "var(--indigo)", icon: "📋" },
    { label: "In Progress", val: tasks.filter(t=>t.status==="In Progress").length, color: "var(--orange)", icon: "🔄" },
    { label: "Completed",   val: tasks.filter(t=>t.status==="Done").length, color: "var(--emerald)", icon: "✅" },
    { label: "Overdue",     val: overdue.length, color: "var(--red)", icon: "⚠️" },
  ];

  return (
    <div className="fade" style={{ padding: 26, maxWidth: 1050 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 800, fontSize: "1.6rem" }}>Good day, {user.name.split(" ")[0]} 👋</div>
        <div style={{ color: "var(--muted2)", marginTop: 3, fontSize: "0.875rem" }}>Here's what's happening across your team today.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--muted2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</div>
            <div style={{ fontWeight: 800, fontSize: "2rem", color: s.color, marginTop: 4 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>My Tasks <span style={{ fontSize: "0.78rem", color: "var(--muted2)", fontWeight: 400 }}>({myTasks.length})</span></div>
          {myTasks.length === 0
            ? <div style={{ color: "var(--muted2)", fontSize: "0.85rem" }}>No tasks assigned to you.</div>
            : myTasks.slice(0,5).map(t => {
                const proj = projects.find(p=>p.id===t.projectId);
                return (
                  <div key={t.id} style={{ background:"var(--surface2)", borderRadius:8, padding:"9px 12px", marginBottom:6, display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:"0.85rem", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</div>
                      <div style={{ fontSize:"0.72rem", color: isOverdue(t.due,t.status) ? "var(--red)" : "var(--muted2)", marginTop:2 }}>{proj?.name} · {isOverdue(t.due,t.status) ? "Overdue" : fmtDate(t.due)}</div>
                    </div>
                    <Badge label={t.status} color={statusColor(t.status)} />
                  </div>
                );
              })
          }
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Project Progress</div>
          {projects.length === 0
            ? <div style={{ color: "var(--muted2)", fontSize: "0.85rem" }}>No projects yet.</div>
            : projects.map(p => {
                const pt = tasks.filter(t=>t.projectId===p.id);
                const pct = pt.length ? Math.round((pt.filter(t=>t.status==="Done").length/pt.length)*100) : 0;
                return (
                  <div key={p.id} style={{ marginBottom: 14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:"0.85rem", fontWeight:500 }}>{p.name}</span>
                      <span style={{ fontSize:"0.78rem", color:"var(--muted2)" }}>{pct}%</span>
                    </div>
                    <div style={{ height:5, background:"var(--surface2)", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:pct+"%", background:p.color, borderRadius:99, transition:"width 0.5s ease" }} />
                    </div>
                    <div style={{ fontSize:"0.72rem", color:"var(--muted2)", marginTop:3 }}>{pt.filter(t=>t.status==="Done").length}/{pt.length} done</div>
                  </div>
                );
              })
          }
        </div>

        {overdue.length > 0 && (
          <div style={{ background:"var(--surface)", border:"1px solid var(--red)20", borderRadius:12, padding:18, gridColumn:"1/-1" }}>
            <div style={{ fontWeight:700, color:"var(--red)", marginBottom:12 }}>⚠️ Overdue Tasks <span style={{ fontSize:"0.8rem", fontWeight:400 }}>({overdue.length})</span></div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:9 }}>
              {overdue.map(t => {
                const assignee = users.find(u=>u.id===t.assigneeId);
                const proj = projects.find(p=>p.id===t.projectId);
                return (
                  <div key={t.id} style={{ background:"var(--red-dim)", border:"1px solid var(--red)25", borderRadius:9, padding:"10px 13px" }}>
                    <div style={{ fontSize:"0.875rem", fontWeight:500 }}>{t.title}</div>
                    <div style={{ fontSize:"0.74rem", color:"var(--muted2)", marginTop:3 }}>{proj?.name} · Due {fmtDate(t.due)}</div>
                    {assignee && <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:7 }}><Avatar user={assignee} size={18}/><span style={{ fontSize:"0.74rem", color:"var(--muted2)" }}>{assignee.name}</span></div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PROJECTS ──────────────────────────────────────────────────────────────────
function ProjectsPage({ projects, tasks, users, user, onNewProject, onDeleteProject }) {
  const [sel, setSel] = useState(null);
  const proj = sel ? projects.find(p=>p.id===sel) : null;
  const ptasks = proj ? tasks.filter(t=>t.projectId===proj.id) : [];

  return (
    <div className="fade" style={{ padding:26 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:"1.4rem" }}>Projects</div>
          <div style={{ color:"var(--muted2)", fontSize:"0.82rem" }}>{projects.length} projects</div>
        </div>
        {user.role==="Admin" && <Btn onClick={onNewProject}>+ New Project</Btn>}
      </div>

      {projects.length === 0
        ? <div style={{ textAlign:"center", padding:"80px 0", color:"var(--muted2)" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:10 }}>📁</div>
            <div>No projects yet. Create one to get started!</div>
          </div>
        : (
          <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:14, alignItems:"start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              {projects.map(p => {
                const pt = tasks.filter(t=>t.projectId===p.id);
                const pct = pt.length ? Math.round((pt.filter(t=>t.status==="Done").length/pt.length)*100) : 0;
                return (
                  <div key={p.id} onClick={() => setSel(p.id)} style={{
                    background: sel===p.id ? p.color+"12" : "var(--surface)",
                    border:`1px solid ${sel===p.id ? p.color+"50" : "var(--border)"}`,
                    borderRadius:11, padding:"13px 15px", cursor:"pointer", transition:"all 0.18s",
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontWeight:600, fontSize:"0.875rem" }}>{p.name}</span>
                      <div style={{ width:9, height:9, borderRadius:"50%", background:p.color, marginTop:3 }} />
                    </div>
                    <div style={{ fontSize:"0.76rem", color:"var(--muted2)", marginBottom:8 }}>{p.description}</div>
                    <div style={{ height:4, background:"var(--surface2)", borderRadius:99, overflow:"hidden", marginBottom:6 }}>
                      <div style={{ height:"100%", width:pct+"%", background:p.color }} />
                    </div>
                    <div style={{ fontSize:"0.72rem", color:"var(--muted2)" }}>{pt.filter(t=>t.status==="Done").length}/{pt.length} tasks</div>
                  </div>
                );
              })}
            </div>

            {proj ? (
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                      <div style={{ width:11, height:11, borderRadius:"50%", background:proj.color }} />
                      <span style={{ fontWeight:700, fontSize:"1.1rem" }}>{proj.name}</span>
                    </div>
                    <div style={{ color:"var(--muted2)", fontSize:"0.82rem", marginTop:3 }}>{proj.description}</div>
                  </div>
                  {user.role==="Admin" && <Btn variant="danger" small onClick={() => { onDeleteProject(proj.id); setSel(null); }}>Delete</Btn>}
                </div>
                {ptasks.length === 0
                  ? <div style={{ color:"var(--muted2)", fontSize:"0.85rem" }}>No tasks in this project.</div>
                  : ["Todo","In Progress","Done"].map(s => {
                      const st = ptasks.filter(t=>t.status===s);
                      if (!st.length) return null;
                      return (
                        <div key={s} style={{ marginBottom:14 }}>
                          <div style={{ fontSize:"0.72rem", fontWeight:700, color:statusColor(s), textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>{s} ({st.length})</div>
                          {st.map(t => {
                            const assignee = users.find(u=>u.id===t.assigneeId);
                            return (
                              <div key={t.id} style={{
                                background:"var(--surface2)", borderRadius:8, padding:"9px 13px", marginBottom:5,
                                display:"flex", justifyContent:"space-between", alignItems:"center",
                                border: isOverdue(t.due,t.status) ? "1px solid var(--red)25" : "1px solid transparent",
                              }}>
                                <div>
                                  <div style={{ fontSize:"0.875rem", fontWeight:500 }}>{t.title}</div>
                                  <div style={{ fontSize:"0.73rem", color: isOverdue(t.due,t.status) ? "var(--red)" : "var(--muted2)", marginTop:2 }}>Due {fmtDate(t.due)}</div>
                                </div>
                                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                                  <Badge label={t.priority} color={priorityColor(t.priority)} />
                                  {assignee && <Avatar user={assignee} size={24} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                }
              </div>
            ) : (
              <div style={{ background:"var(--surface)", border:"1px dashed var(--border)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", minHeight:280, color:"var(--muted2)", flexDirection:"column", gap:8 }}>
                <div style={{ fontSize:"2rem" }}>📁</div>
                <div>Select a project</div>
              </div>
            )}
          </div>
        )
      }
    </div>
  );
}

// ── TASKS ─────────────────────────────────────────────────────────────────────
function TasksPage({ tasks, projects, users, user, onNewTask, onUpdateTask, onDeleteTask }) {
  const [filter, setFilter] = useState("All");
  const [projFilter, setProjFilter] = useState("All");
  const [editTask, setEditTask] = useState(null);

  const myTasks = user.role==="Admin" ? tasks : tasks.filter(t=>t.assigneeId===user.id);
  const filtered = myTasks.filter(t =>
    (filter==="All" || t.status===filter) &&
    (projFilter==="All" || t.projectId===+projFilter)
  );

  return (
    <div className="fade" style={{ padding:26, maxWidth:880 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:"1.4rem" }}>{user.role==="Admin" ? "All Tasks" : "My Tasks"}</div>
          <div style={{ color:"var(--muted2)", fontSize:"0.82rem" }}>{filtered.length} tasks</div>
        </div>
        {user.role==="Admin" && <Btn onClick={onNewTask}>+ New Task</Btn>}
      </div>

      <div style={{ display:"flex", gap:9, marginBottom:18, flexWrap:"wrap" }}>
        <div style={{ display:"flex", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:9, overflow:"hidden" }}>
          {["All","Todo","In Progress","Done"].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding:"7px 13px", border:"none", background: filter===s ? "var(--indigo)" : "transparent",
              color: filter===s ? "#fff" : "var(--muted2)", cursor:"pointer", fontFamily:"Plus Jakarta Sans",
              fontSize:"0.8rem", fontWeight:600, transition:"all 0.15s",
            }}>{s}</button>
          ))}
        </div>
        <select value={projFilter} onChange={e=>setProjFilter(e.target.value)} style={{ width:"auto", padding:"7px 13px" }}>
          <option value="All">All Projects</option>
          {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        {filtered.length===0 && <div style={{ textAlign:"center", padding:"60px 0", color:"var(--muted2)" }}>No tasks found.</div>}
        {filtered.map(t => {
          const proj = projects.find(p=>p.id===t.projectId);
          const assignee = users.find(u=>u.id===t.assigneeId);
          const od = isOverdue(t.due, t.status);
          return (
            <div key={t.id} style={{
              background:"var(--surface)", border:`1px solid ${od?"var(--red)25":"var(--border)"}`,
              borderRadius:11, padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:10,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:11, minWidth:0 }}>
                <div onClick={() => {
                  const next = t.status==="Todo" ? "In Progress" : t.status==="In Progress" ? "Done" : "Todo";
                  onUpdateTask({...t, status:next});
                }} style={{
                  width:19, height:19, borderRadius:"50%", border:`2px solid ${statusColor(t.status)}`,
                  background: t.status==="Done" ? statusColor(t.status) : "transparent",
                  cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.65rem",
                }}>{t.status==="Done" && "✓"}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:"0.875rem", fontWeight:500, textDecoration:t.status==="Done"?"line-through":"none", color:t.status==="Done"?"var(--muted2)":"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</div>
                  <div style={{ fontSize:"0.73rem", color: od?"var(--red)":"var(--muted2)", marginTop:2 }}>
                    <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:proj?.color, marginRight:5 }} />
                    {proj?.name} · {od ? "Overdue" : `Due ${fmtDate(t.due)}`}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
                <Badge label={t.priority} color={priorityColor(t.priority)} />
                <Badge label={t.status} color={statusColor(t.status)} />
                {assignee && <Avatar user={assignee} size={26} />}
                {user.role==="Admin" && <>
                  <Btn variant="ghost" small onClick={()=>setEditTask(t)}>✏️</Btn>
                  <Btn variant="danger" small onClick={()=>onDeleteTask(t.id)}>🗑</Btn>
                </>}
              </div>
            </div>
          );
        })}
      </div>
      {editTask && <TaskModal task={editTask} projects={projects} users={users} onClose={()=>setEditTask(null)} onSave={t=>{onUpdateTask(t);setEditTask(null);}} />}
    </div>
  );
}

// ── TEAM ──────────────────────────────────────────────────────────────────────
function TeamPage({ users, tasks, user: me }) {
  return (
    <div className="fade" style={{ padding:26, maxWidth:860 }}>
      <div style={{ fontWeight:800, fontSize:"1.4rem", marginBottom:4 }}>Team</div>
      <div style={{ color:"var(--muted2)", fontSize:"0.82rem", marginBottom:20 }}>{users.length} members</div>
      {users.length===0
        ? <div style={{ textAlign:"center", padding:"80px 0", color:"var(--muted2)" }}>No team members yet.</div>
        : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
            {users.map(u => {
              const ut = tasks.filter(t=>t.assigneeId===u.id);
              return (
                <div key={u.id} style={{
                  background:"var(--surface)", border:`1px solid ${u.id===me.id?u.color+"40":"var(--border)"}`,
                  borderRadius:13, padding:"18px 18px",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:14 }}>
                    <Avatar user={u} size={42} />
                    <div>
                      <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{u.name}</div>
                      <div style={{ fontSize:"0.76rem", color:"var(--muted2)" }}>{u.email}</div>
                      <Badge label={u.role} color={u.role==="Admin"?"var(--indigo)":"var(--emerald)"} />
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {[{l:"Total",v:ut.length,c:"var(--muted2)"},{l:"Active",v:ut.filter(t=>t.status==="In Progress").length,c:"var(--orange)"},{l:"Done",v:ut.filter(t=>t.status==="Done").length,c:"var(--emerald)"}].map(s => (
                      <div key={s.l} style={{ flex:1, background:"var(--surface2)", borderRadius:7, padding:"7px 9px", textAlign:"center" }}>
                        <div style={{ fontWeight:700, fontSize:"1.1rem", color:s.c }}>{s.v}</div>
                        <div style={{ fontSize:"0.68rem", color:"var(--muted2)" }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────
function AdminPage({ users, setUsers, tasks }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", pass:"", role:"Member" });
  const [err, setErr] = useState("");
  const COLORS = ["#6366f1","#10b981","#f97316","#0ea5e9","#8b5cf6","#ef4444"];

  const toggleRole = (id) => {
    const updated = users.map(u => u.id===id ? {...u, role: u.role==="Admin"?"Member":"Admin"} : u);
    setUsers(updated);
    localStorage.setItem("fd_users", JSON.stringify(updated));
  };
  const deleteUser = (id) => {
    const updated = users.filter(u=>u.id!==id);
    setUsers(updated);
    localStorage.setItem("fd_users", JSON.stringify(updated));
  };
  const addMember = () => {
    if (!form.name || !form.email || !form.pass) return setErr("Fill all fields.");
    if (users.find(u=>u.email===form.email.trim())) return setErr("Email already exists.");
    const initials = form.name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    const color = COLORS[users.length % COLORS.length];
    const newUser = { id: Date.now(), name: form.name.trim(), email: form.email.trim(), pass: form.pass, role: form.role, avatar: initials, color };
    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem("fd_users", JSON.stringify(updated));
    setForm({ name:"", email:"", pass:"", role:"Member" });
    setErr("");
    setShowAdd(false);
  };

  return (
    <div className="fade" style={{ padding:26, maxWidth:780 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:"1.4rem" }}>Admin Panel</div>
          <div style={{ color:"var(--muted2)", fontSize:"0.82rem" }}>Manage users and roles</div>
        </div>
        <Btn onClick={()=>setShowAdd(true)}>+ Add Member</Btn>
      </div>

      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid var(--border)", background:"var(--surface2)" }}>
              {["User","Email","Role","Tasks","Actions"].map(h=>(
                <th key={h} style={{ padding:"11px 15px", textAlign:"left", fontSize:"0.72rem", color:"var(--muted2)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom:"1px solid var(--border)20" }}>
                <td style={{ padding:"11px 15px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <Avatar user={u} size={28} />
                    <span style={{ fontWeight:500, fontSize:"0.85rem" }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding:"11px 15px", color:"var(--muted2)", fontSize:"0.82rem" }}>{u.email}</td>
                <td style={{ padding:"11px 15px" }}><Badge label={u.role} color={u.role==="Admin"?"var(--indigo)":"var(--emerald)"} /></td>
                <td style={{ padding:"11px 15px", color:"var(--muted2)", fontSize:"0.82rem" }}>{tasks.filter(t=>t.assigneeId===u.id).length}</td>
                <td style={{ padding:"11px 15px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <Btn variant="ghost" small onClick={()=>toggleRole(u.id)}>Toggle Role</Btn>
                    <Btn variant="danger" small onClick={()=>deleteUser(u.id)}>Remove</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Add New Member" onClose={()=>{ setShowAdd(false); setErr(""); }}>
          <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
            <input placeholder="Full name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
            <input placeholder="Email" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
            <input placeholder="Password" type="password" value={form.pass} onChange={e=>setForm(f=>({...f,pass:e.target.value}))} />
            <div>
              <label style={{ fontSize:"0.75rem", color:"var(--muted2)", display:"block", marginBottom:4 }}>Role</label>
              <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                <option>Member</option>
                <option>Admin</option>
              </select>
            </div>
            {err && <div style={{ color:"var(--red)", fontSize:"0.8rem" }}>{err}</div>}
            <Btn full onClick={addMember}>Add Member</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── TASK MODAL ────────────────────────────────────────────────────────────────
function TaskModal({ task, projects, users, onClose, onSave }) {
  const [form, setForm] = useState(task || {
    title:"", status:"Todo", priority:"Medium",
    projectId: projects[0]?.id||"", assigneeId: users[0]?.id||"",
    due: new Date(Date.now()+7*86400000).toISOString().slice(0,10), desc:"",
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <Modal title={task?.id ? "Edit Task" : "New Task"} onClose={onClose}>
      <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
        <input placeholder="Task title" value={form.title} onChange={e=>set("title",e.target.value)} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
          <div>
            <label style={{ fontSize:"0.75rem", color:"var(--muted2)", display:"block", marginBottom:4 }}>Status</label>
            <select value={form.status} onChange={e=>set("status",e.target.value)}>
              {["Todo","In Progress","Done"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:"0.75rem", color:"var(--muted2)", display:"block", marginBottom:4 }}>Priority</label>
            <select value={form.priority} onChange={e=>set("priority",e.target.value)}>
              {["Low","Medium","High"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:"0.75rem", color:"var(--muted2)", display:"block", marginBottom:4 }}>Project</label>
            <select value={form.projectId} onChange={e=>set("projectId",+e.target.value)}>
              {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:"0.75rem", color:"var(--muted2)", display:"block", marginBottom:4 }}>Assignee</label>
            <select value={form.assigneeId} onChange={e=>set("assigneeId",+e.target.value)}>
              {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontSize:"0.75rem", color:"var(--muted2)", display:"block", marginBottom:4 }}>Due Date</label>
            <input type="date" value={typeof form.due==="number" ? new Date(form.due).toISOString().slice(0,10) : form.due} onChange={e=>set("due",e.target.value)} />
          </div>
        </div>
        <textarea placeholder="Description (optional)" rows={2} value={form.desc} onChange={e=>set("desc",e.target.value)} />
        <Btn full onClick={() => {
          if (!form.title.trim()) return;
          const due = typeof form.due==="string" ? new Date(form.due).getTime() : form.due;
          onSave({...form, due, id: form.id||Date.now()});
        }}>{task?.id ? "Save Changes" : "Create Task"}</Btn>
      </div>
    </Modal>
  );
}

// ── PROJECT MODAL ─────────────────────────────────────────────────────────────
function ProjectModal({ onClose, onSave, users }) {
  const colors = ["#6366f1","#10b981","#f97316","#0ea5e9","#8b5cf6","#ef4444"];
  const [form, setForm] = useState({ name:"", description:"", color:colors[0], members:[] });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <Modal title="New Project" onClose={onClose}>
      <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
        <input placeholder="Project name" value={form.name} onChange={e=>set("name",e.target.value)} />
        <input placeholder="Description" value={form.description} onChange={e=>set("description",e.target.value)} />
        <div>
          <label style={{ fontSize:"0.75rem", color:"var(--muted2)", display:"block", marginBottom:7 }}>Color</label>
          <div style={{ display:"flex", gap:8 }}>
            {colors.map(c=>(
              <div key={c} onClick={()=>set("color",c)} style={{ width:26, height:26, borderRadius:"50%", background:c, cursor:"pointer", border: form.color===c?"3px solid #fff":"3px solid transparent", transition:"all 0.15s" }} />
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize:"0.75rem", color:"var(--muted2)", display:"block", marginBottom:7 }}>Members</label>
          {users.map(u=>(
            <label key={u.id} style={{ display:"flex", alignItems:"center", gap:9, marginBottom:7, cursor:"pointer" }}>
              <input type="checkbox" checked={form.members.includes(u.id)} onChange={e=>set("members", e.target.checked?[...form.members,u.id]:form.members.filter(id=>id!==u.id))} style={{ width:"auto" }} />
              <Avatar user={u} size={22} />
              <span style={{ fontSize:"0.85rem" }}>{u.name}</span>
              <Badge label={u.role} color={u.role==="Admin"?"var(--indigo)":"var(--emerald)"} />
            </label>
          ))}
        </div>
        <Btn full onClick={()=>{ if(!form.name.trim()) return; onSave({...form, id:Date.now()}); }}>Create Project</Btn>
      </div>
    </Modal>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    if (user) {
      setUsers(JSON.parse(localStorage.getItem("fd_users")||"[]"));
      setProjects(JSON.parse(localStorage.getItem("fd_projects")||"[]"));
      setTasks(JSON.parse(localStorage.getItem("fd_tasks")||"[]"));
    }
  }, [user]);

  const saveProjects = (p) => { setProjects(p); localStorage.setItem("fd_projects", JSON.stringify(p)); };
  const saveTasks = (t) => { setTasks(t); localStorage.setItem("fd_tasks", JSON.stringify(t)); };

  if (!user) return <AuthScreen onLogin={u => { setUser(u); }} />;

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <Sidebar page={page} setPage={setPage} user={user} projects={projects}
        onLogout={() => { setUser(null); setPage("dashboard"); setTasks([]); setProjects([]); setUsers([]); }}
        onNewProject={() => setShowProjModal(true)}
      />
      <main style={{ flex:1, overflowY:"auto", maxHeight:"100vh" }}>
        {page==="dashboard" && <DashboardPage user={user} tasks={tasks} projects={projects} users={users} />}
        {page==="projects"  && <ProjectsPage projects={projects} tasks={tasks} users={users} user={user} onNewProject={()=>setShowProjModal(true)} onDeleteProject={id=>saveProjects(projects.filter(p=>p.id!==id))} />}
        {page==="tasks"     && <TasksPage tasks={tasks} projects={projects} users={users} user={user} onNewTask={()=>setShowTaskModal(true)} onUpdateTask={t=>saveTasks(tasks.map(x=>x.id===t.id?t:x))} onDeleteTask={id=>saveTasks(tasks.filter(x=>x.id!==id))} />}
        {page==="team"      && <TeamPage users={users} tasks={tasks} user={user} />}
        {page==="admin"     && <AdminPage users={users} setUsers={setUsers} tasks={tasks} />}
      </main>

      {showTaskModal && <TaskModal projects={projects} users={users} onClose={()=>setShowTaskModal(false)} onSave={t=>{ saveTasks([...tasks,t]); setShowTaskModal(false); }} />}
      {showProjModal && <ProjectModal users={users} onClose={()=>setShowProjModal(false)} onSave={p=>{ saveProjects([...projects,p]); setShowProjModal(false); }} />}
    </div>
  );
}
