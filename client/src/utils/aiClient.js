export async function askLLM(messages, lang = "en-IN") {
  const res = await fetch("/api/talk", {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ lang, messages })
  });
  if (!res.ok) throw new Error("AI error");
  return res.json(); // => { text, suggested_intent?, media? }
}
