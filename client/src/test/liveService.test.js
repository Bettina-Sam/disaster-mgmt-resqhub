import { describe, it, expect, beforeEach } from "vitest";
import {
  quakeSeverity, normalizeUSGS, normalizeGDACS, normalizeEONET, dedupe, inIndia,
  createReport, getReports, setTriage, deleteReport,
} from "../services/liveService";

describe("quakeSeverity", () => {
  it("maps magnitude to severity bands", () => {
    expect(quakeSeverity(3.1)).toBe("LOW");
    expect(quakeSeverity(4.5)).toBe("MEDIUM");
    expect(quakeSeverity(5.5)).toBe("HIGH");
    expect(quakeSeverity(7.2)).toBe("CRITICAL");
  });
});

describe("normalizeUSGS", () => {
  const geo = { features: [
    { id: "us1", properties: { mag: 5.6, place: "10 km N of Somewhere", time: 1790000000000, url: "https://x", tsunami: 0 }, geometry: { coordinates: [88.1, 27.3, 12] } },
    { id: "bad", properties: { mag: null }, geometry: { coordinates: [0, 0, 0] } },
  ] };
  it("keeps valid events and converts [lng,lat] to {lat,lng}", () => {
    const out = normalizeUSGS(geo);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ _id: "usgs-us1", type: "EARTHQUAKE", severity: "HIGH", source: "USGS", verified: true });
    expect(out[0].location).toEqual({ lat: 27.3, lng: 88.1 });
  });
  it("tolerates empty or missing input", () => {
    expect(normalizeUSGS(null)).toEqual([]);
    expect(normalizeUSGS({})).toEqual([]);
  });
});

describe("normalizeGDACS", () => {
  const geo = { features: [
    { geometry: { type: "Point", coordinates: [80.2, 13.1] }, properties: { eventtype: "TC", eventid: 7, name: "Cyclone Test", alertlevel: "Orange", country: "India", fromdate: "2026-10-01T00:00:00", htmldescription: "<b>Orange</b> cyclone" } },
    { geometry: { type: "Point", coordinates: [0, 0] }, properties: { eventtype: "EQ", eventid: 1 } },
    { geometry: { type: "Polygon", coordinates: [] }, properties: { eventtype: "FL", eventid: 2 } },
  ] };
  it("maps types and alert levels, drops earthquakes (USGS covers them) and non-point geometry", () => {
    const out = normalizeGDACS(geo);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ _id: "gdacs-TC-7", type: "CYCLONE", severity: "HIGH", address: "India" });
    expect(out[0].description).toBe("Orange cyclone");
  });
});

describe("normalizeEONET", () => {
  const json = { events: [
    { id: "E1", title: "Fire A", categories: [{ id: "wildfires" }], geometry: [{ type: "Point", coordinates: [78, 20], date: "2026-10-02T00:00:00Z" }], link: "l" },
    { id: "E2", title: "Typhoon", categories: [{ id: "severeStorms" }], geometry: [{ type: "Point", coordinates: [140, 15], date: "2026-10-02T00:00:00Z", magnitudeValue: 100, magnitudeUnit: "kts" }] },
    { id: "E3", title: "Sea ice", categories: [{ id: "seaLakeIce" }], geometry: [{ type: "Point", coordinates: [0, 0], date: "2026-10-02T00:00:00Z" }] },
  ] };
  it("maps categories, rates storms by wind speed and skips irrelevant categories", () => {
    const out = normalizeEONET(json);
    expect(out.map((o) => o.type)).toEqual(["FIRE", "CYCLONE"]);
    expect(out[1].severity).toBe("CRITICAL");
  });
});

describe("dedupe", () => {
  const mk = (id, type, lat, lng) => ({ _id: id, type, location: { lat, lng } });
  it("drops secondary items close to a primary item of the same type only", () => {
    const primary = [mk("p", "CYCLONE", 10, 80)];
    const secondary = [mk("near", "CYCLONE", 10.5, 80.5), mk("far", "CYCLONE", 30, 120), mk("othertype", "FIRE", 10, 80)];
    expect(dedupe(primary, secondary, 150).map((x) => x._id)).toEqual(["p", "far", "othertype"]);
  });
});

describe("inIndia", () => {
  it("recognises Indian cities and rejects other places", () => {
    expect(inIndia([13.08, 80.27])).toBe(true); // Chennai
    expect(inIndia([11.6, 92.7])).toBe(true); // Andaman
    expect(inIndia([51.5, -0.12])).toBe(false); // London
    expect(inIndia(null)).toBe(false);
  });
});

describe("community reports and triage", () => {
  beforeEach(() => localStorage.clear());

  it("stores reports as unverified community items and can delete them", () => {
    const r = createReport({ title: "Water logging", type: "FLOOD", severity: "LOW", location: { lat: 13, lng: 80 } });
    expect(r).toMatchObject({ source: "COMMUNITY", verified: false, status: "OPEN" });
    expect(getReports()).toHaveLength(1);
    deleteReport(r._id);
    expect(getReports()).toHaveLength(0);
  });

  it("keeps triage status for live items and for reports", () => {
    const r = createReport({ title: "x", type: "FIRE", severity: "LOW", location: { lat: 1, lng: 1 } });
    setTriage(r._id, "ACK");
    expect(getReports()[0].status).toBe("ACK");
    setTriage("usgs-abc", "RESOLVED");
    expect(JSON.parse(localStorage.getItem("rsq:triage:v1"))["usgs-abc"].status).toBe("RESOLVED");
    setTriage("usgs-abc", "OPEN");
    expect(JSON.parse(localStorage.getItem("rsq:triage:v1"))["usgs-abc"]).toBeUndefined();
  });
});
