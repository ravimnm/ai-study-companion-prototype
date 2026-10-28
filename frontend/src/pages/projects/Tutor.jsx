import { useEffect, useRef, useState } from "react";
import { Bot, Send, User, BookOpen, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import { askTutor, getConversations } from "../../services/api/tutor";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

function asText(value) {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (typeof value === "object") {
    return (
      value.answer ||
      value.content ||
      value.message ||
      value.text ||
      JSON.stringify(value, null, 2)
    );
  }
  return String(value);
}

function normalizeMessages(conversation) {
  const messages = conversation?.messages || [];
  return Array.isArray(messages)
    ? messages
        .filter((message) => message?.content != null)
        .map((message) => ({
          role: message.role === "user" ? "user" : "assistant",
          content: asText(message.content),
          citations: Array.isArray(message.citations) ? message.citations : [],
        }))
    : [];
}

export default function Tutor() {
  const { projectId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadConversation() {
      try {
        const response = await getConversations(projectId);
        const conversations = Array.isArray(response)
          ? response
          : response?.conversations || response?.items || [];

        const conversation = conversations?.[0];

        if (active && conversation) {
          setConversationId(
            conversation.id ||
              conversation.conversation_id ||
              conversation._id ||
              null
          );
          setMessages(normalizeMessages(conversation));
        }
      } catch {
        // A new project may simply have no conversation yet.
      } finally {
        if (active) setLoading(false);
      }
    }

    loadConversation();

    return () => {
      active = false;
    };
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleSubmit(event) {
    event.preventDefault();

    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setError("");

    setMessages((current) => [
      ...current,
      { role: "user", content: text, citations: [] },
    ]);

    setSending(true);

    try {
      const response = await askTutor(projectId, text, conversationId);

      const answer = asText(
        response?.answer ||
          response?.message ||
          response?.content ||
          response?.response
      );

      const nextConversationId =
        response?.conversation_id ||
        response?.conversationId ||
        conversationId;

      if (nextConversationId) {
        setConversationId(nextConversationId);
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: answer || "I couldn't generate an answer.",
          citations: Array.isArray(response?.citations)
            ? response.citations
            : [],
        },
      ]);
    } catch (err) {
      const message =
        err?.message || "The tutor could not process your request.";

      setError(message);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I couldn't process that request. Check the project materials and try again.",
          citations: [],
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-230px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Bot size={21} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">AI Tutor</h2>
            <p className="text-xs text-slate-400">
              Ask questions using your project knowledge
            </p>
          </div>

          <div className="ml-auto hidden items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 sm:flex">
            <Sparkles size={13} />
            Grounded AI
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
        {messages.length === 0 && (
          <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BookOpen size={25} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              What would you like to learn?
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Ask about concepts from your uploaded materials. The tutor will
              use relevant project context when answering.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "Explain the main concepts",
                "Give me an example",
                "What should I learn next?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Bot size={16} />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-50 text-slate-700"
              }`}
            >
              <p className="whitespace-pre-wrap">
                {asText(message.content)}
              </p>

              {message.citations?.length > 0 && (
                <div className="mt-3 border-t border-slate-200 pt-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Sources
                  </p>

                  <div className="space-y-1">
                    {message.citations.map((citation, citationIndex) => (
                      <div
                        key={citationIndex}
                        className="text-xs text-slate-500"
                      >
                        {citation?.file_name ||
                          citation?.source_file_name ||
                          `Source ${citationIndex + 1}`}
                        {citation?.page_number
                          ? ` · Page ${citation.page_number}`
                          : ""}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {message.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Bot size={16} />
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <Spinner size={17} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="border-t border-red-100 bg-red-50 px-5 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-200 bg-white p-4 sm:p-5"
      >
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit(event);
              }
            }}
            placeholder="Ask your tutor..."
            rows={2}
            className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

          <Button
            type="submit"
            disabled={!input.trim() || sending}
            className="h-12 w-12 shrink-0 !px-0"
          >
            <Send size={17} />
          </Button>
        </div>

        <p className="mt-2 text-[11px] text-slate-400">
          Enter to send · Shift + Enter for a new line
        </p>
      </form>
    </div>
  );
}
