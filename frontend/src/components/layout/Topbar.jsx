import { useEffect, useRef, useState } from "react";
import { Bell, Search, BookOpen, FolderKanban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api/client";

export default function Topbar() {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [query, setQuery] = useState("");
  const [spaces, setSpaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load searchable workspace data once.
  useEffect(() => {
    async function loadWorkspaceData() {
      try {
        setLoading(true);

        const [spacesResponse, projectsResponse] = await Promise.all([
          api.get("/api/spaces"),
          api.get("/api/projects"),
        ]);

        const spaceData = Array.isArray(spacesResponse)
          ? spacesResponse
          : spacesResponse?.items ||
            spacesResponse?.spaces ||
            spacesResponse?.data ||
            [];

        const projectData = Array.isArray(projectsResponse)
          ? projectsResponse
          : projectsResponse?.items ||
            projectsResponse?.projects ||
            projectsResponse?.data ||
            [];

        setSpaces(spaceData);
        setProjects(projectData);
      } catch (error) {
        console.error("Failed to load search data:", error);
        setSpaces([]);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaceData();
  }, []);

  // Close search dropdown when clicking outside.
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSearch(value) {
    setQuery(value);

    const trimmedQuery = value.trim().toLowerCase();

    if (!trimmedQuery) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const matchedSpaces = spaces
      .filter((space) =>
        String(space.name || space.title || "")
          .toLowerCase()
          .includes(trimmedQuery)
      )
      .slice(0, 5)
      .map((space) => ({
        type: "space",
        id: space.id,
        name: space.name || space.title || "Untitled Space",
        description: space.description || "",
      }));

    const matchedProjects = projects
      .filter((project) =>
        String(project.name || project.title || "")
          .toLowerCase()
          .includes(trimmedQuery)
      )
      .slice(0, 5)
      .map((project) => ({
        type: "project",
        id: project.id,
        name: project.name || project.title || "Untitled Project",
        description: project.description || "",
      }));

    setResults([...matchedSpaces, ...matchedProjects]);
    setShowResults(true);
  }

  function handleResultClick(result) {
    setQuery("");
    setResults([]);
    setShowResults(false);

    if (result.type === "space") {
      navigate(`/spaces/${result.id}`);
      return;
    }

    if (result.type === "project") {
      navigate(`/projects/${result.id}`);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setShowResults(false);
      return;
    }

    if (event.key === "Enter" && results.length > 0) {
      handleResultClick(results[0]);
    }
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
      <div
        ref={searchRef}
        className="relative hidden w-full max-w-md md:block"
      >
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={query}
          onChange={(event) => handleSearch(event.target.value)}
          onFocus={() => {
            if (query.trim()) {
              setShowResults(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search your learning workspace..."
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
        />

        {showResults && (
          <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {loading ? (
              <div className="px-4 py-4 text-sm text-slate-500">
                Loading workspace...
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onClick={() => handleResultClick(result)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      {result.type === "space" ? (
                        <BookOpen size={17} />
                      ) : (
                        <FolderKanban size={17} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-800">
                        {result.name}
                      </div>

                      <div className="text-xs text-slate-400">
                        {result.type === "space"
                          ? "Space"
                          : "Project"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-4">
                <div className="text-sm font-medium text-slate-700">
                  No results found
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Try another space or project name.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-500" />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            RS
          </div>

          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-slate-800">
              Student
            </div>

            <div className="text-xs text-slate-400">
              Learner
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}