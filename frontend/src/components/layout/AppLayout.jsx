import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Modal from "../ui/Modal";
import useAuth from "../../hooks/useAuth";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <div className="min-w-0 flex-1">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main
          className={
            compactMode
              ? "p-3 sm:p-4 lg:p-5"
              : "p-4 sm:p-6 lg:p-8"
          }
        >
          <Outlet />
        </main>
      </div>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings"
      >
        <div className="space-y-4">

          {/* Account */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              Account
            </p>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Name
                </span>
                <span className="text-sm font-medium text-slate-800">
                  {user?.name || user?.full_name || "Student"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Email
                </span>
                <span className="max-w-[65%] truncate text-sm font-medium text-slate-800">
                  {user?.email || "Not available"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Role
                </span>
                <span className="text-sm font-medium capitalize text-slate-800">
                  {user?.role || "student"}
                </span>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Appearance
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Adjust the amount of space used by the learning workspace.
              </p>
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Compact layout
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Reduce page spacing to show more content.
                </p>
              </div>

              <input
                type="checkbox"
                checked={compactMode}
                onChange={(event) =>
                  setCompactMode(event.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          {/* AI Tutor */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-800">
              AI Tutor
            </p>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Grounded answers
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Tutor answers use your project materials.
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Enabled
              </span>
            </div>
          </div>

          {/* Close */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Done
            </button>
          </div>

        </div>
      </Modal>
    </div>
  );
}