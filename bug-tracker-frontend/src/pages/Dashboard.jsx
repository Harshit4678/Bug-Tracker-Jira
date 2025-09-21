// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
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
  const [clientFiltered, setClientFiltered] = useState(null); // immediate preview
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false); // bottom sheet
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false); // NEW: mobile search overlay
  const nav = useNavigate();
  const { logout } = useAuthStore();

  const searchTimer = useRef(null);
  const searchInputRef = useRef(null);

  // improved load: accepts optional overrideQ to run search with given query
  const load = async (overrideQ) => {
    try {
      setLoading(true);
      const qs = new URLSearchParams();
      const useQ = typeof overrideQ === "string" ? overrideQ : q;
      if (useQ) qs.set("q", useQ);
      if (status) qs.set("status", status);
      if (severity) qs.set("severity", severity);
      const data = await fetchBugs(qs.toString());
      setBugs(Array.isArray(data) ? data : []);
      setClientFiltered(null);
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

  // client-side filtering helper
  const clientFilterLocal = (val) => {
    if (!val) {
      setClientFiltered(null);
      return;
    }
    const vv = val.toLowerCase();
    const filtered = bugs.filter((b) => {
      const idMatch = b._id?.toLowerCase().includes(vv);
      const titleMatch = b.title?.toLowerCase().includes(vv);
      const descMatch = b.description?.toLowerCase().includes(vv);
      const nameMatch = b.createdBy?.name?.toLowerCase().includes(vv);
      return idMatch || titleMatch || descMatch || nameMatch;
    });
    setClientFiltered(filtered);
  };

  // mobile helpers
  const openFilters = () => setMobileFiltersOpen(true);
  const applyMobileFilters = () => {
    setMobileFiltersOpen(false);
    load();
  };
  const resetMobileFilters = () => {
    setStatus("");
    setSeverity("");
    setQ("");
    setClientFiltered(null);
    setMobileFiltersOpen(false);
    load();
  };

  // UI helpers
  const focusSearch = () => {
    // open mobile search overlay on small screens
    setMobileSearchOpen(true);
    // focus after overlay opens
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 120);
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    // optionally clear input on close: don't clear by default to keep state
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 pb-4">
      <Toaster position="top-right" />

      {/* Mobile Search Overlay (slides from top) */}
      <div
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-200 ${
          mobileSearchOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        aria-hidden={!mobileSearchOpen}
      >
        <div className="bg-white border-b shadow-md p-3">
          <div className="flex items-center gap-2">
            <button
              onClick={closeMobileSearch}
              className="p-2 rounded-md text-gray-600"
              aria-label="close search"
            >
              ✕
            </button>
            <div className="flex-1">
              <input
                ref={searchInputRef}
                value={q}
                onChange={(e) => {
                  const v = e.target.value;
                  setQ(v);
                  clientFilterLocal(v);
                  if (searchTimer.current) clearTimeout(searchTimer.current);
                  searchTimer.current = setTimeout(() => {
                    load(v);
                    searchTimer.current = null;
                  }, 300);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (searchTimer.current) {
                      clearTimeout(searchTimer.current);
                      searchTimer.current = null;
                    }
                    load(q);
                    // Keep overlay open so user sees results
                  }
                }}
                placeholder="Search id, title, description or reporter"
                className="w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <button
              onClick={() => {
                if (searchTimer.current) {
                  clearTimeout(searchTimer.current);
                  searchTimer.current = null;
                }
                load(q);
              }}
              className="px-3 py-2 rounded-md bg-indigo-600 text-white"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Topbar: logo + profile only */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center lg:items-start">
              <img
                src="/logo.svg"
                alt="EnterSoft"
                className="h-14 sm:h-16 w-auto"
              />
              {/* slogan shown only on desktop (lg+) and placed just under the logo */}
              <p className="hidden lg:block text-sm text-gray-600 mt-1">
                Track, update & collaborate effortlessly
              </p>
            </div>
          </div>

          {/* center empty on mobile; show search on md+ */}
          <div className="hidden md:flex flex-1 justify-center px-6">
            <div className="w-full max-w-2xl">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  value={q}
                  onChange={(e) => {
                    const v = e.target.value;
                    setQ(v);
                    clientFilterLocal(v);
                    if (searchTimer.current) clearTimeout(searchTimer.current);
                    searchTimer.current = setTimeout(() => {
                      load(v);
                      searchTimer.current = null;
                    }, 300);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (searchTimer.current) {
                        clearTimeout(searchTimer.current);
                        searchTimer.current = null;
                      }
                      load(q);
                    }
                  }}
                  placeholder="Search id, title, description or reporter"
                  className="w-full border rounded-lg px-12 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <button
                  onClick={() => {
                    if (searchTimer.current) {
                      clearTimeout(searchTimer.current);
                      searchTimer.current = null;
                    }
                    load(q);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* profile avatar on right */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen((s) => !s)}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 shadow-sm border"
              title="Profile"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <div className="text-sm font-medium truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role || "reporter"}
                </div>
              </div>
            </button>

            {/* profile dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-50">
                <div className="p-3 border-b text-sm">
                  <div className="font-medium">{user?.name || "User"}</div>
                  <div className="text-xs text-gray-500">
                    {user?.email || ""}
                  </div>
                </div>
                <div className="flex flex-col">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setCreateOpen(true);
                    }}
                    className="text-left px-4 py-2 hover:bg-gray-50"
                  >
                    + Create bug
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      doLogout();
                    }}
                    className="text-left px-4 py-2 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar (desktop only) */}
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
                    onClick={() => load()}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setQ("");
                      setStatus("");
                      setSeverity("");
                      setClientFiltered(null);
                      load();
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    Reset
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
                Showing {(clientFiltered ?? bugs).length} results
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
                  {(clientFiltered ?? bugs).length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No bugs found. Create one!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(clientFiltered ?? bugs).map((b) => (
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

        {/* Right insights (desktop) */}
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

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[min(720px,94%)] bg-white rounded-2xl shadow-lg border px-2 py-2 flex items-center justify-between sm:hidden">
        {/* Search icon */}
        <button
          onClick={focusSearch}
          className="flex-1 flex flex-col items-center gap-1 py-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <span className="text-xs text-gray-600">Search</span>
        </button>

        {/* Filters */}
        <button
          onClick={openFilters}
          className="flex-1 flex flex-col items-center gap-1 py-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 14.414V19a1 1 0 01-.553.894l-4 2A1 1 0 019 21v-6.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          <span className="text-xs text-gray-600">Filter</span>
        </button>

        {/* Create */}
        <button
          onClick={() => setCreateOpen(true)}
          className="flex-1 flex flex-col items-center gap-1 py-2"
        >
          <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white">
            +
          </div>
          <span className="text-xs text-gray-600">Create</span>
        </button>

        {/* Logout */}
        <button
          onClick={doLogout}
          className="flex-1 flex flex-col items-center gap-1 py-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"
            />
          </svg>
          <span className="text-xs text-gray-600">Logout</span>
        </button>
      </nav>

      {/* Mobile Filters Bottom Sheet */}
      <div
        className={`fixed inset-0 z-50 ${
          mobileFiltersOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            mobileFiltersOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileFiltersOpen(false)}
        />
        <div
          className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-xl transform transition-transform ${
            mobileFiltersOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-gray-500"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1 p-3 border rounded-md"
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
                  className="w-full mt-1 p-3 border rounded-md"
                >
                  <option value="">Any</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={applyMobileFilters}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-md"
                >
                  Apply
                </button>
                <button
                  onClick={resetMobileFilters}
                  className="flex-1 px-4 py-3 border rounded-md"
                >
                  Reset
                </button>
              </div>

              <div className="mt-3 text-sm text-gray-500">
                Tip: Type in search bar to preview results in real-time. Press
                Enter or Apply to run server search.
              </div>
            </div>
          </div>
        </div>
      </div>

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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="EnterSoft" className="h-12 sm:h-14" />
          </div>
          <div className="text-xs text-gray-500">
            © {new Date().getFullYear()} EnterSoft — All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
