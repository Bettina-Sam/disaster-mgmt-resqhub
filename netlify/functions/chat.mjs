// Netlify Function: proxies chat to Gemini so the API key never reaches the browser.
// Set GEMINI_API_KEY in the Netlify site environment variables. If it is missing or the
// quota runs out, this returns an error and the app falls back to its built-in guidance.

const MODEL = "gemini-2.5-flash";
const MAX_MESSAGE = 600;
const LANG_NAME = { en: "English", hi: "Hindi", ta: "Tamil" };

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const key = process.env.GEMINI_API_KEY;
  if (!key) return json({ error: "ai_not_configured" }, 503);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const message = String(body?.message || "").trim().slice(0, MAX_MESSAGE);
  if (!message) return json({ error: "empty_message" }, 400);
  const lang = LANG_NAME[body?.lang] ? body.lang : "en";

  const history = Array.isArray(body?.history) ? body.history.slice(-6) : [];
  const contents = [
    ...history
      .filter((m) => m && typeof m.text === "string" && (m.role === "user" || m.role === "assistant"))
      .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.text.slice(0, 600) }] })),
    { role: "user", parts: [{ text: message }] },
  ];

  const system =
    `You are ResQ, a calm disaster-safety assistant inside the ResQHub app, used mainly in India but worldwide. ` +
    `Give short, practical, step-by-step guidance on floods, earthquakes, cyclones, fires, heatwaves, landslides, first aid and preparedness. ` +
    `Keep answers under 120 words. Reply only in ${LANG_NAME[lang]}. ` +
    `For any life-threatening situation, tell the user to call the local emergency number first (112 in India). ` +
    `Never claim to be an official warning service. If asked something unrelated to safety or preparedness, politely steer back to it. ` +
    `If you are not sure, say so rather than guessing.`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
      }),
    });
    if (!res.ok) return json({ error: "upstream", status: res.status }, 502);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("").trim();
    if (!text) return json({ error: "empty_reply" }, 502);
    return json({ text });
  } catch {
    return json({ error: "network" }, 502);
  }
};

export const config = { path: "/api/chat" };
