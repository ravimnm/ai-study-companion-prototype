import { ArrowRight, BookOpen, Brain, Target, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Home() {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const token = isAuthenticated;

  const handleStartLearning = () => {
    navigate(token ? "/dashboard" : "/register");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              AI
            </div>

            <span className="text-xl font-semibold">
              Study Companion
            </span>
          </div>

          <div className="flex items-center gap-3">
            {token ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Sign in
                </button>

                <button
                  onClick={() => navigate("/register")}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="mx-auto max-w-7xl px-6 pb-20 pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <Brain className="h-4 w-4" />
              AI-Powered Learning & Growth Workspace
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Learn smarter.
              <br />
              <span className="text-blue-600">Grow continuously.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Study Companion connects your learning materials, AI Tutor,
              adaptive assessments, mastery tracking, growth analysis, and
              personalized recommendations in one workspace.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={handleStartLearning}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Start Learning
                <ArrowRight className="h-5 w-5" />
              </button>

              {!token && (
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-xl border border-slate-300 px-7 py-3.5 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  I already have an account
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Learning loop */}
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold">
                Your complete learning loop
              </h2>

              <p className="mt-4 text-slate-600">
                Everything you need to understand, practice, measure, and
                improve.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Feature
                icon={<BookOpen className="h-6 w-6" />}
                title="Learn from your materials"
                description="Upload your learning material and build a project-specific knowledge base."
              />

              <Feature
                icon={<Brain className="h-6 w-6" />}
                title="Ask your AI Tutor"
                description="Get contextual explanations grounded in your project's learning material."
              />

              <Feature
                icon={<Target className="h-6 w-6" />}
                title="Measure mastery"
                description="Use adaptive quizzes and assessments to understand what you know."
              />

              <Feature
                icon={<BarChart3 className="h-6 w-6" />}
                title="Track your growth"
                description="Understand concept trends and receive actionable next steps."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-6 py-20">
          <div className="rounded-3xl bg-blue-600 px-8 py-14 text-center text-white sm:px-16">
            <h2 className="text-3xl font-bold">
              Turn learning into a continuous process.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-blue-100">
              Create a project, add your materials, learn with AI, test
              yourself, and let your learning history guide what comes next.
            </p>

            <button
              onClick={handleStartLearning}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-blue-600 hover:bg-blue-50"
            >
              Get started
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}