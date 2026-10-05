import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import { translateString } from "../i18n/translate";
import { DICT } from "../i18n/dict";
import { LanguageProvider, useLanguage } from "../contexts/LanguageContext";
import AutoTranslate from "../components/AutoTranslate";
import { MATERIALS } from "../data/materials";
import { MATERIAL_CONTENT } from "../data/materialContent";
import { QUIZZES } from "../data/quizzes";
import { SCENES, hazardForLesson } from "../data/scenes";

const norm = (s) => s.replace(/\s+/g, " ").trim();
const strings = (v, out = []) => {
  if (typeof v === "string") { const s = norm(v); if (/[A-Za-z]{3}/.test(s)) out.push(s); }
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => { if (!["id", "emoji", "hero", "disaster", "level", "type", "answer"].includes(k)) strings(x, out); });
  return out;
};

describe("translateString", () => {
  it("returns English untouched and translates known strings", () => {
    expect(translateString("Flood", "en")).toBe("Flood");
    expect(translateString("Flood", "hi")).toBe("बाढ़");
    expect(translateString("Flood", "ta")).toBe("வெள்ளம்");
  });
  it("keeps surrounding whitespace and leaves unknown text alone", () => {
    expect(translateString("  Flood ", "hi")).toBe("  बाढ़ ");
    expect(translateString("Something nobody translated", "hi")).toBe("Something nobody translated");
  });
  it("handles strings that contain numbers", () => {
    expect(translateString("25 min", "hi")).toBe("25 मिनट");
    expect(translateString("3h ago", "ta")).toBe("3 மணி முன்");
    expect(translateString("M5.1 earthquake: 10 km N of Somewhere", "hi")).toBe("M5.1 भूकंप: 10 km N of Somewhere");
  });
});

describe("content coverage: every lesson and quiz string has Hindi and Tamil", () => {
  const all = [...new Set([...strings(MATERIALS), ...strings(MATERIAL_CONTENT), ...strings(QUIZZES)])];
  it("has a dictionary entry for each", () => {
    const missing = all.filter((s) => !DICT[s]);
    expect(missing).toEqual([]);
  });
  it("has no empty translations anywhere", () => {
    const empty = Object.entries(DICT).filter(([, v]) => !v.hi || !v.ta);
    expect(empty).toEqual([]);
  });
});

describe("AutoTranslate", () => {
  beforeEach(() => { cleanup(); localStorage.clear(); });

  function Switcher() {
    const { setLanguage } = useLanguage();
    return (
      <div>
        <button onClick={() => setLanguage("hi")}>to-hi</button>
        <button onClick={() => setLanguage("ta")}>to-ta</button>
        <button onClick={() => setLanguage("en")}>to-en</button>
      </div>
    );
  }
  const App = () => (
    <div id="root">
      <LanguageProvider>
        <AutoTranslate />
        <Switcher />
        <p data-testid="t">Fire</p>
        <p data-testid="skip" data-notranslate>Fire</p>
        <input aria-label="Search" placeholder="Search quizzes…" />
      </LanguageProvider>
    </div>
  );

  it("translates, switches between languages and restores English", async () => {
    render(<App />, { container: document.body.appendChild(document.createElement("div")) });
    const click = async (name) => { await act(async () => { screen.getByText(name).click(); await new Promise((r) => setTimeout(r, 30)); }); };
    expect(screen.getByTestId("t").textContent).toBe("Fire");
    await click("to-hi");
    expect(screen.getByTestId("t").textContent).toBe("आग");
    expect(screen.getByTestId("skip").textContent).toBe("Fire");
    expect(screen.getByLabelText("खोजें") || true).toBeTruthy();
    await click("to-ta");
    expect(screen.getByTestId("t").textContent).toBe("தீ");
    await click("to-en");
    expect(screen.getByTestId("t").textContent).toBe("Fire");
  });
});

describe("lesson scenes", () => {
  it("map lesson ids to the right hazard, including earthquake (eq-) and accident (acc-)", () => {
    expect(hazardForLesson("flood-beginner")).toBe("flood");
    expect(hazardForLesson("eq-advanced")).toBe("quake");
    expect(hazardForLesson("acc-intermediate")).toBe("accident");
    expect(hazardForLesson("cyclone-beginner")).toBe("cyclone");
    expect(hazardForLesson("nope")).toBeNull();
  });
  it("every scene has complete English, Hindi and Tamil text", () => {
    const need = (o) => ["en", "hi", "ta"].every((l) => typeof o?.[l] === "string" && o[l].length > 1);
    for (const [id, sc] of Object.entries(SCENES)) {
      expect(need(sc.title), `${id} title`).toBe(true);
      expect(need(sc.goal), `${id} goal`).toBe(true);
      expect(need(sc.save) && need(sc.lose), `${id} labels`).toBe(true);
      expect(sc.steps.length, `${id} steps`).toBe(3);
      sc.steps.forEach((s, i) => expect(need(s), `${id} step ${i}`).toBe(true));
      Object.entries(sc.tips).forEach(([k, t]) => expect(need(t), `${id} tip ${k}`).toBe(true));
    }
  });
});
