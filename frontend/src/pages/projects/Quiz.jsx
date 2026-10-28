import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Trophy,
  XCircle,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  generateQuiz,
  startQuiz,
  answerQuestion,
  completeQuiz,
} from "../../services/api/quiz";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

export default function Quiz() {
  const { projectId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState("");
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    createQuiz();
  }, [projectId]);

  async function createQuiz() {
    try {
      setLoading(true);
      const created = await generateQuiz(projectId, 5);
      const quizId = created?.id || created?.quiz_id;

      if (!quizId) {
        throw new Error("Quiz ID was not returned by the server.");
      }

      const started = await startQuiz(quizId);
      setQuiz(started?.quiz || started);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer() {
    if (!selected || submitting) return;

    const question = quiz?.questions?.[current];
    if (!question) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await answerQuestion(
        quiz.id,
        question.id,
        selected
      );

      setAnswers((old) => ({
        ...old,
        [question.id]: {
          answer: selected,
          result: response,
        },
      }));

      setFeedback(response?.answer || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNext() {
    if (submitting) return;

    if (current < quiz.questions.length - 1) {
      setCurrent((value) => value + 1);
      setSelected("");
      setFeedback(null);
      return;
    }

    setSubmitting(true);

    try {
      const finalResult = await completeQuiz(quiz.id);
      setResult(finalResult);
      setCompleted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={30} />
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!quiz) return null;

  if (completed) {
    const rawScore = result?.score ?? result?.quiz?.score ?? 0;
    const maxScore = result?.max_score ?? result?.quiz?.max_score ?? 0;

    const percentage =
      result?.percentage ??
      (maxScore > 0 ? (rawScore / maxScore) * 100 : 0);

    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <Trophy size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            Quiz completed
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Your assessment has been recorded and your mastery can now be
            updated.
          </p>

          <div className="mx-auto mt-7 flex h-28 w-28 items-center justify-center rounded-full border-8 border-blue-100">
            <span className="text-2xl font-bold text-blue-600">
              {Math.round(percentage)}%
            </span>
          </div>

          {maxScore > 0 && (
            <p className="mt-3 text-sm text-slate-500">
              {rawScore} of {maxScore} scored answers correct
            </p>
          )}

          <Button
            className="mt-7"
            onClick={() => window.location.reload()}
          >
            Take another quiz
          </Button>
        </Card>
      </div>
    );
  }

  const question = quiz.questions?.[current];

  if (!question) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-500">
          No quiz questions were returned.
        </p>
      </Card>
    );
  }

  const progress = ((current + 1) / quiz.questions.length) * 100;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Adaptive Quiz
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Question {current + 1} of {quiz.questions.length}
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
          {question.difficulty || "medium"}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <CircleHelp size={19} />
          </div>

          <h3 className="text-lg font-semibold leading-7 text-slate-900">
            {question.question}
          </h3>
        </div>

        {question.type === "open_ended" ? (
          <textarea
            value={selected}
            disabled={Boolean(feedback)}
            onChange={(event) => setSelected(event.target.value)}
            rows={6}
            placeholder="Write your answer..."
            className="mt-7 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        ) : (
          <div className="mt-7 space-y-3">
            {(question.options || []).map((option, index) => {
              const active = selected === option;

              return (
                <button
                  key={index}
                  disabled={Boolean(feedback)}
                  onClick={() => setSelected(option)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition ${
                    active
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      active
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}
                  >
                    {active && (
                      <CheckCircle2
                        size={14}
                        className="text-white"
                      />
                    )}
                  </div>

                  {option}
                </button>
              );
            })}
          </div>
        )}

        {feedback && (
          <div
            className={`mt-7 rounded-xl border p-4 ${
              feedback.is_correct === true
                ? "border-green-200 bg-green-50"
                : feedback.is_correct === false
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.is_correct === true ? (
                <CheckCircle2 size={17} className="text-green-600" />
              ) : feedback.is_correct === false ? (
                <XCircle size={17} className="text-red-600" />
              ) : (
                <CircleHelp size={17} className="text-slate-500" />
              )}

              <span className="text-sm font-semibold text-slate-800">
                {feedback.is_correct === true
                  ? "Correct"
                  : feedback.is_correct === false
                    ? "Not quite"
                    : "Answer saved"}
              </span>

              {typeof feedback.score === "number" && (
                <span className="ml-auto text-xs font-medium text-slate-500">
                  Score {feedback.score.toFixed(2)}
                </span>
              )}
            </div>

            {feedback.feedback && (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {feedback.feedback}
              </p>
            )}

            {feedback.missing_concepts?.length > 0 && (
              <p className="mt-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-600">
                  Missing:
                </span>{" "}
                {feedback.missing_concepts.join(", ")}
              </p>
            )}

            {feedback.misconceptions?.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-600">
                  Misconceptions:
                </span>{" "}
                {feedback.misconceptions.join(", ")}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        <div className="mt-7 flex justify-end">
          {feedback ? (
            <Button onClick={handleNext} disabled={submitting}>
              {submitting
                ? "Finishing..."
                : current === quiz.questions.length - 1
                  ? "Finish quiz"
                  : "Next question"}
              {!submitting && <ChevronRight size={17} />}
            </Button>
          ) : (
            <Button
              onClick={handleAnswer}
              disabled={!selected || submitting}
            >
              {submitting ? "Checking..." : "Check answer"}
              {!submitting && <ChevronRight size={17} />}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
