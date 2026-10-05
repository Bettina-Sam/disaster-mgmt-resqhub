import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { recordGame, summary, loadGames } from "../utils/gameProgress";

import FloodBeginner from "../components/games/FloodBeginner";
import FloodMedium from "../components/games/FloodMedium";
import FloodAdvanced from "../components/games/FloodAdvanced";
import FireBeginner from "../components/games/FireBeginner";
import FireMedium from "../components/games/FireMedium";
import FireAdvanced from "../components/games/FireAdvanced";
import CycloneBeginner from "../components/games/CycloneBeginner";
import CycloneMedium from "../components/games/CycloneMedium";
import CycloneAdvanced from "../components/games/CycloneAdvanced";
import QuakeBeginner from "../components/games/QuakeBeginner";
import QuakeMedium from "../components/games/QuakeMedium";
import QuakeAdvanced from "../components/games/QuakeAdvanced";
import AccidentBeginner from "../components/games/AccidentBeginner";
import AccidentMedium from "../components/games/AccidentMedium";
import AccidentAdvanced from "../components/games/AccidentAdvanced";

const GAMES = {
  "flood-beginner": FloodBeginner, "flood-medium": FloodMedium, "flood-advanced": FloodAdvanced,
  "fire-beginner": FireBeginner, "fire-medium": FireMedium, "fire-advanced": FireAdvanced,
  "cyclone-beginner": CycloneBeginner, "cyclone-medium": CycloneMedium, "cyclone-advanced": CycloneAdvanced,
  "quake-beginner": QuakeBeginner, "quake-medium": QuakeMedium, "quake-advanced": QuakeAdvanced,
  "accident-beginner": AccidentBeginner, "accident-medium": AccidentMedium, "accident-advanced": AccidentAdvanced,
};

beforeEach(() => {
  cleanup();
  localStorage.clear();
  // jsdom has no speech or audio APIs; the games call them defensively in real browsers.
  window.speechSynthesis = { cancel() {}, speak() {}, getVoices: () => [] };
  window.SpeechSynthesisUtterance = function () {};
  window.AudioContext = undefined;
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
});

describe("all 15 games", () => {
  for (const [id, Game] of Object.entries(GAMES)) {
    it(`${id} renders and unmounts cleanly`, () => {
      const { container, unmount } = render(<Game onExit={() => {}} />);
      expect(container.firstChild).not.toBeNull();
      unmount();
    });
  }
});

describe("tap and keyboard play (works without drag-and-drop)", () => {
  it("Accident Beginner: tapping the four essentials wins and records the result", () => {
    const { getByText, getByLabelText, queryByText } = render(<AccidentBeginner onExit={() => {}} />);
    // Before Start, tapping must do nothing.
    fireEvent.click(getByLabelText("Pack Bandage"));
    expect(loadGames()["accident-beginner"]).toBeUndefined();

    fireEvent.click(getByText("Start"));
    for (const label of ["Bandage", "Antiseptic", "Gauze", "Wrap"]) fireEvent.click(getByLabelText(`Pack ${label}`));
    expect(queryByText("VICTORY")).not.toBeNull();
    expect(loadGames()["accident-beginner"]).toMatchObject({ plays: 1, wins: 1 });
  });

  it("Cyclone Beginner: tap an item, then a zone, places it", () => {
    const { getByText, getByLabelText, container } = render(<CycloneBeginner onExit={() => {}} />);
    fireEvent.click(getByText("Start"));
    const firstItem = container.querySelector(".inv-item");
    fireEvent.click(firstItem);
    expect(firstItem.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(getByLabelText("Put picked item indoors (safe)"));
    expect(firstItem.className).toContain("g-good");
  });
});

describe("game progress", () => {
  it("counts plays and wins per game", () => {
    recordGame("flood-beginner", false);
    recordGame("flood-beginner", true);
    recordGame("fire-medium", false);
    expect(loadGames()["flood-beginner"]).toMatchObject({ plays: 2, wins: 1 });
    expect(summary()).toMatchObject({ total: 15, won: 1, plays: 3 });
  });
});
