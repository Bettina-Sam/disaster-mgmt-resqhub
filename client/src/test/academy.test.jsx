import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Quiz from "../pages/Quiz";
import Certificate from "../pages/Certificate";
import { AuthProvider } from "../contexts/AuthContext";
import { QUIZZES } from "../data/quizzes";
import { getLessonResult } from "../utils/progress";

vi.mock("qrcode", () => ({ default: { toDataURL: () => Promise.resolve("data:image/png;base64,AAAA") } }));
vi.mock("../hooks/useConfetti", () => ({ default: () => ({ burst: () => {} }) }));

const quiz = QUIZZES[0];

function renderQuiz() {
  return render(
    <MemoryRouter initialEntries={[`/academy/quiz/${quiz.id}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/academy/quiz/:id" element={<Quiz />} />
          <Route path="/academy/certificate" element={<Certificate />} />
          <Route path="/academy" element={<div>Academy home</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

function answerAll({ correct }) {
  quiz.questions.forEach((q, i) => {
    if (q.type === "MCQ") {
      const target = correct ? q.answer : (q.answer + 1) % q.choices.length;
      fireEvent.click(screen.getAllByRole("radio")[target]);
    } else {
      const truth = correct ? q.answer : !q.answer;
      fireEvent.click(screen.getByLabelText(truth ? "True" : "False"));
    }
    fireEvent.click(screen.getByText(i < quiz.questions.length - 1 ? "Next" : "Finish"));
  });
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
});

describe("quiz to certificate flow", () => {
  it("passing the quiz stores the result and unlocks the certificate", () => {
    renderQuiz();
    answerAll({ correct: true });
    expect(screen.getByText(/Your score: 100%/)).toBeTruthy();
    expect(getLessonResult(quiz.id)).toMatchObject({ score: 100, passed: true });

    fireEvent.click(screen.getByText("Get Certificate"));
    expect(screen.queryByText(/certificate is locked/i)).toBeNull();
    expect(screen.getByText("Download PDF").disabled).toBe(false);
    expect(screen.getAllByText(quiz.title).length).toBeGreaterThan(0);
  });

  it("failing the quiz does not offer a certificate", () => {
    renderQuiz();
    answerAll({ correct: false });
    expect(getLessonResult(quiz.id)?.passed).toBeFalsy();
    expect(screen.queryByText("Get Certificate")).toBeNull();
  });

  it("opening the certificate URL directly without passing shows it locked", () => {
    render(
      <MemoryRouter initialEntries={[`/academy/certificate?quiz=${quiz.id}&course=${encodeURIComponent(quiz.title)}`]}>
        <AuthProvider>
          <Routes><Route path="/academy/certificate" element={<Certificate />} /></Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/certificate is locked/i)).toBeTruthy();
    expect(screen.getByText("Download PNG").disabled).toBe(true);
  });
});
