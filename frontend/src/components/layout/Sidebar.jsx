import { NavLink, useNavigate } from "react-router-dom";
import { X, LayoutDashboard, BookOpen, FolderKanban, BarChart3, Lightbulb, ShieldCheck, Settings, LogOut } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/spaces", label: "Spaces", icon: BookOpen },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
];

export default function Sidebar({ mobileOpen = false, onMobileClose, onSettingsClick }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = () => onMobileClose?.();

  const content = (mobile = false) => (
    <>
      <div className="flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">AI</div>
          <div>
            <div className="text-sm font-bold text-slate-900">Study Companion</div>
            <div className="text-xs text-slate-400">Learning workspace</div>
          </div>
        </div>
        {mobile && (
          <button onClick={onMobileClose} aria-label="Close sidebar" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Workspace</div>
        <div className="space-y-1">
          {links.filter(({ to }) => to !== "/admin" || user?.role === "admin").map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={handleNavigate} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button onClick={onSettingsClick} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800">
          <Settings size={18} /> Settings
        </button>
        <button onClick={() => { signOut(); onMobileClose?.(); navigate("/login"); }} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">{content(false)}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close sidebar" onClick={onMobileClose} className="absolute inset-0 bg-slate-900/30" />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl">{content(true)}</aside>
        </div>
      )}
    </>
  );
}
