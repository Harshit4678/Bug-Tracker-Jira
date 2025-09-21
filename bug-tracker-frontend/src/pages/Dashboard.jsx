import React, { useEffect, useState, useMemo } from "react";
import { fetchBugs, updateBug, createBug } from "../api";
import BugForm from "./BugForm";
import Modal from "../components/Modal";
import BugCard from "../components/BugCard";
import KpiCard from "../components/KpiCard";
import StatusDonut from "../components/StatusDonut";
import ActivityFeed from "../components/ActivityFeed";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import useAuthStore from "../store/authStore";

/* decode JWT */
function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default function Dashboard() {
  const [bugs, setBugs] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [open, setOpen] = useState(false); // mobile menu
  const nav = useNavigate();
  const { logout } = useAuthStore();

  const load = async () => {
    try {
      setLoading(true);
      const qs = new URLSearchParams();
      if (q) qs.set("q", q);
      if (status) qs.set("status", status);
      if (severity) qs.set("severity", severity);
      const data = await fetchBugs(qs.toString());
      setBugs(Array.isArray(data) ? data : []);
      // build simple activities from bugs (client-side)
      const acts = (Array.isArray(data) ? data : [])
        .slice()
        .reverse()
        .slice(0, 8)
        .map((b) => ({
          id: b._id + "-created",
          actorName: b.createdBy?.name || "User",
          action: "reported a bug",
          targetTitle: b.title,
          at: b.createdAt,
        }));
      setActivities(acts);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bugs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser(parseJwt(token) || null);
    }
    load();
    // eslint-disable-next-line
  }, []);

  const stats = useMemo(() => {
    const s = {
      Open: 0,
      "In Progress": 0,
      Closed: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };
    bugs.forEach((b) => {
      s[b.status] = (s[b.status] || 0) + 1;
      s[b.severity] = (s[b.severity] || 0) + 1;
    });
    return s;
  }, [bugs]);

  const doUpdate = async (id, newStatus) => {
    try {
      await updateBug(id, { status: newStatus });
      toast.success("Status updated");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const onCreate = async (body) => {
    try {
      await createBug(body);
      setCreateOpen(false);
      toast.success("Bug created");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Create failed");
    }
  };

  const doLogout = () => {
    logout(); // clears token + user
    nav("/login"); // redirect
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Toaster position="top-right" />

      {/* Topbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex flex-col items-center">
            <img
              src="/logo.svg"
              alt="EnterSoft Bug Tracker"
              className="h-16 sm:h-20 w-auto"
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Track, update & collaborate effortlessly
            </p>
          </div>

          {/* Search (center) */}
          <div className="flex-1 hidden md:flex items-center justify-center">
            <div className="w-full max-w-xl">
              <label className="relative block">
                <span className="sr-only">Search bugs</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by title, id or description"
                  className="w-full border rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setCreateOpen(true)}
              className="hidden md:inline-block px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg shadow hover:scale-[1.02] transition-transform"
            >
              + Create Bug
            </button>

            <div className="hidden sm:flex items-center gap-3 bg-white/80 px-3 py-2 rounded-full shadow-sm border">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-sm min-w-0">
                <div className="font-medium truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role || "reporter"}
                </div>
              </div>
            </div>

            <button
              onClick={doLogout}
              className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50 transition"
            >
              Logout
            </button>

            {/* Mobile menu button */}
            <button
              className="sm:hidden p-2 rounded-md border bg-white"
              onClick={() => setOpen((s) => !s)}
              aria-label="menu"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile collapsible */}
        <div
          className={`sm:hidden overflow-hidden transition-max-h duration-200 ${
            open ? "max-h-56" : "max-h-0"
          }`}
        >
          <div className="px-4 py-3 space-y-3">
            <button
              onClick={() => {
                setCreateOpen(true);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              + Create Bug
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 border rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar (filters) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 self-start">
          <div className="bg-white p-4 rounded-2xl shadow-md border">
            <h4 className="text-sm font-semibold mb-3">Filters</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Any</option>
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Closed</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Any</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500">Quick actions</label>
                <div className="mt-2 flex flex-col gap-2">
                  <button
                    onClick={load}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setQ("");
                      setStatus("");
                      setSeverity("");
                      load();
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <label className="text-xs text-gray-500">Snapshot</label>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        JSON.stringify({ total: bugs.length, stats })
                      );
                      toast.success("Snapshot copied");
                    }}
                    className="flex-1 px-3 py-2 border rounded-md"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-white p-4 rounded-2xl shadow-md border">
            <h4 className="text-sm font-semibold mb-2">KPIs</h4>
            <div className="grid grid-cols-2 gap-3">
              <KpiCard title="Total" value={bugs.length} delta={0} />
              <KpiCard title="Open" value={stats.Open || 0} delta={0} />
              <KpiCard
                title="In Progress"
                value={stats["In Progress"] || 0}
                delta={0}
              />
              <KpiCard title="Closed" value={stats.Closed || 0} delta={0} />
            </div>
          </div>
        </aside>

        {/* Main list */}
        <section className="lg:col-span-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Bugs</h2>
              <div className="text-sm text-gray-500">
                Showing {bugs.length} results
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow border">
              {/* Loading skeleton */}
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-start gap-3"
                    >
                      <div className="h-12 w-12 rounded bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                        <div className="h-3 w-1/2 bg-gray-200 rounded mt-2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <AnimatePresence>
                  {bugs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No bugs found. Create one!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bugs.map((b) => (
                        <Motion.div
                          key={b._id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.18 }}
                        >
                          <BugCard
                            bug={b}
                            onChangeStatus={doUpdate}
                            canEdit={
                              user?.role === "admin" ||
                              (b.createdBy && b.createdBy._id === user?.id)
                            }
                          />
                        </Motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Pagination placeholder */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Updated: {new Date().toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border rounded">Prev</button>
                <button className="px-3 py-1 border rounded">Next</button>
              </div>
            </div>
          </div>
        </section>

        {/* Right insights (sticky on large) */}
        <aside className="lg:col-span-3 sticky top-24 self-start space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-md border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Status</h3>
              <div className="text-xs text-gray-400">Overview</div>
            </div>
            <div className="flex items-center gap-4">
              <StatusDonut
                counts={{
                  Open: stats.Open || 0,
                  "In Progress": stats["In Progress"] || 0,
                  Closed: stats.Closed || 0,
                }}
                size={110}
              />
              <div className="text-sm">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>{" "}
                    Open{" "}
                    <span className="ml-auto font-medium">
                      {stats.Open || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-600"></span>{" "}
                    In Progress{" "}
                    <span className="ml-auto font-medium">
                      {stats["In Progress"] || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-500"></span>{" "}
                    Closed{" "}
                    <span className="ml-auto font-medium">
                      {stats.Closed || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-md border">
            <h4 className="text-sm font-semibold mb-2">Activity</h4>
            <ActivityFeed activities={activities} />
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-md border">
            <h4 className="text-sm font-semibold mb-2">Quick actions</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setCreateOpen(true)}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Create bug
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(
                    JSON.stringify({ total: bugs.length, stats })
                  );
                  toast.success("Snapshot copied");
                }}
                className="px-3 py-2 border rounded"
              >
                Copy snapshot
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create new bug"
      >
        <BugForm onCreate={onCreate} />
      </Modal>

      {/* Footer */}
      <footer className="mt-8 border-t border-gray-100 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="EnterSoft" className="h-10" />
            <div className="text-xs text-gray-500 hidden sm:block">
              EnterSoft
            </div>
          </div>
          <div className="text-xs text-gray-500">
            © {new Date().getFullYear()} EnterSoft — All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
