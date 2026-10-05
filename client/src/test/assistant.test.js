import { describe, it, expect, vi, afterEach } from "vitest";
import { localAnswer, GUIDANCE } from "../data/guidance";
import { askAssistant } from "../services/assistant";
import { normalizeOverpass, classify, buildQuery } from "../services/nearbyService";
import { EMERGENCY_NUMBERS } from "../data/emergencyNumbers";
import en from "../i18n/en.json";
import hi from "../i18n/hi.json";
import ta from "../i18n/ta.json";

afterEach(() => vi.restoreAllMocks());

describe("built-in guidance", () => {
  it("answers each hazard in all three languages", () => {
    for (const g of GUIDANCE) for (const l of ["en", "hi", "ta"]) expect(g[l]?.length).toBeGreaterThan(20);
  });
  it("routes English, Hindi and Tamil keywords", () => {
    expect(localAnswer("what to do in a flood", "en")).toMatch(/higher ground/);
    expect(localAnswer("भूकंप आया", "hi")).toMatch(/भूकंप/);
    expect(localAnswer("வெள்ளம் வந்தால்", "ta")).toMatch(/வெள்ளம்/);
  });
  it("falls back to a helpful default for unknown questions", () => {
    expect(localAnswer("tell me a joke", "en")).toMatch(/112/);
  });
});

describe("askAssistant", () => {
  it("uses the AI reply when the server answers", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ text: "AI says hi" }) }));
    expect(await askAssistant("flood", "en")).toEqual({ text: "AI says hi", source: "ai" });
  });
  it("falls back to built-in guidance when the key or quota is missing (503)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }));
    const r = await askAssistant("flood", "en");
    expect(r.source).toBe("built-in");
    expect(r.text).toMatch(/higher ground/);
  });
  it("falls back when offline", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect((await askAssistant("earthquake", "en")).source).toBe("built-in");
  });
});

describe("nearby service", () => {
  it("classifies OSM tags and sorts results by distance", () => {
    expect(classify({ amenity: "hospital" })).toBe("hospital");
    expect(classify({ emergency: "assembly_point" })).toBe("shelter");
    const json = { elements: [
      { type: "node", id: 1, lat: 13.2, lon: 80.3, tags: { amenity: "police", name: "Far PS" } },
      { type: "way", id: 2, center: { lat: 13.081, lon: 80.271 }, tags: { amenity: "hospital", name: "Near Hospital", phone: "+91 44 1234" } },
      { type: "node", id: 3, tags: {} },
    ] };
    const out = normalizeOverpass(json, [13.08, 80.27]);
    expect(out.map((p) => p.name)).toEqual(["Near Hospital", "Far PS"]);
    expect(buildQuery(13, 80, 5000)).toContain("around:5000,13,80");
  });
});

describe("static data", () => {
  it("every country has at least one emergency number", () => {
    for (const c of Object.values(EMERGENCY_NUMBERS)) expect(c.numbers.length).toBeGreaterThan(0);
  });
  it("Hindi and Tamil cover every English UI string", () => {
    const missing = (o) => Object.keys(en).filter((k) => !(k in o));
    expect(missing(hi)).toEqual([]);
    expect(missing(ta)).toEqual([]);
  });
});
