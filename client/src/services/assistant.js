import { localAnswer } from "../data/guidance";

const ENDPOINT = "/api/chat";
const TIMEOUT_MS = 9000;

/**
 * Ask the assistant. Tries the server-side AI first; if that is missing, out of quota,
 * offline or slow, answers from the built-in guidance so the user always gets something useful.
 * Returns { text, source: "ai" | "built-in" }.
 */
export async function askAssistant(message, lang = "en", history = []) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, lang, history: history.map((m) => ({ role: m.role, text: m.text })) }),
      signal: ctl.signal,
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.text) return { text: data.text, source: "ai" };
    }
  } catch {
    /* fall through to built-in guidance */
  } finally {
    clearTimeout(timer);
  }
  return { text: localAnswer(message, lang), source: "built-in" };
}
