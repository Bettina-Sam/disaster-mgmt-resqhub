// client/src/pages/Quiz.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizById, DISASTER_EMOJI } from "../data/quizzes";

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quiz = getQuizById(id);

  const [idx, setIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [done, setDone] = React.useState(false);
  const [score, setScore] = React.useState(0);

  if (!quiz) {
    return (
      <div className="container-xxl page-gap">
        <div className="alert alert-danger">Quiz not found.</div>
        <button className="btn btn-outline-secondary" onClick={()=>navigate("/academy?tab=quizzes")}>Back to Quizzes</button>
      </div>
    );
  }

  const q = quiz.questions[idx];
  const emoji = DISASTER_EMOJI[quiz.disaster] || "🎓";

  const selectAnswer = (choiceIndexOrBool) => {
    setAnswers((prev) => ({ ...prev, [idx]: choiceIndexOrBool }));
  };

  const next = () => {
    if (idx < quiz.questions.length - 1) setIdx(idx + 1);
    else finish();
  };

  const finish = () => {
    const correct = quiz.questions.reduce((t, it, i) => {
      if (it.type === "MCQ") return t + ((answers[i] === it.answer) ? 1 : 0);
      if (it.type === "TF")  return t + ((answers[i] === it.answer) ? 1 : 0);
      return t;
    }, 0);
    const pct = Math.round((correct / quiz.questions.length) * 100);
    setScore(pct);
    setDone(true);
  };

  return (
    <div className="container-xxl page-gap">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">{emoji} {quiz.title}</h3>
        <div className="d-flex align-items-center gap-2">
          <span className="badge text-bg-dark">{quiz.disaster}</span>
          <span className={`badge ${
            quiz.level === "BEGINNER" ? "text-bg-success" :
            quiz.level === "INTERMEDIATE" ? "text-bg-warning" : "text-bg-danger"
          }`}>{quiz.level}</span>
        </div>
      </div>

      {!done ? (
        <div className="card">
          <div className="card-body">
            <div className="mb-2 text-muted">Question {idx + 1} / {quiz.questions.length}</div>
            <h5 className="mb-3">{q.q}</h5>

            {q.type === "MCQ" && (
              <div className="vstack gap-2 mb-3">
                {q.choices.map((c, i) => (
                  <label key={i} className="d-flex align-items-center gap-2">
                    <input
                      type="radio"
                      name={`q-${idx}`}
                      checked={answers[idx] === i}
                      onChange={() => selectAnswer(i)}
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === "TF" && (
              <div className="d-flex gap-3 mb-3">
                <label className="d-flex align-items-center gap-2">
                  <input type="radio" name={`q-${idx}`} checked={answers[idx] === true} onChange={()=>selectAnswer(true)} />
                  <span>True</span>
                </label>
                <label className="d-flex align-items-center gap-2">
                  <input type="radio" name={`q-${idx}`} checked={answers[idx] === false} onChange={()=>selectAnswer(false)} />
                  <span>False</span>
                </label>
              </div>
            )}

            {answers[idx] !== undefined && q.explain && (
              <div className="alert alert-info py-2">{q.explain}</div>
            )}

            <div className="d-flex justify-content-between">
              <button className="btn btn-outline-secondary" onClick={()=>navigate("/academy?tab=quizzes")}>Quit</button>
              <button className="btn btn-primary" onClick={next} disabled={answers[idx] === undefined}>
                {idx < quiz.questions.length - 1 ? "Next" : "Finish"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <h5 className="mb-2">Your score: {score}%</h5>
            <div className="mb-3">
              {score >= quiz.passingScore
                ? <span className="badge text-bg-success">Passed</span>
                : <span className="badge text-bg-secondary">Completed</span>}
              <span className="ms-2 text-muted small">Passing: {quiz.passingScore}%</span>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary" onClick={()=>navigate("/academy?tab=quizzes")}>Back to Quizzes</button>
              {score >= quiz.passingScore && (
                <button className="btn btn-primary" onClick={()=>navigate("/academy/certificate")}>
                  Get Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
