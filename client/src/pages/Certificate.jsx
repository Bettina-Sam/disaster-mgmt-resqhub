import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Link, useSearchParams } from "react-router-dom";
import { LESSONS } from "../data/academy";
import { getLessonResult } from "../utils/progress";
import { downloadPNGFromNode, downloadPDFFromNode } from "../utils/certificate";
import useConfetti from "../hooks/useConfetti";

// Optional assets
import seal from "../assets/seal.jpg";
import sign from "../assets/signature.jpg";

function makeCertId(name, course) {
  const seed = `${name}|${course}|${new Date().toISOString().slice(0,10)}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) { h = (h << 5) - h + seed.charCodeAt(i); h |= 0; }
  const n = Math.abs(h).toString().padStart(8, "0").slice(0, 8);
  return `RSQ-${n}`;
}

export default function Certificate() {
  const [sp] = useSearchParams();
  const name = sp.get("name") || "Learner";
  const course = sp.get("course") || "ResQAcademy Course";
  const ref = useRef(null);
  const { burst } = useConfetti();

  // Try to find the lesson by course title to show score if available
  const lesson = useMemo(() => LESSONS.find(l => l.title === course), [course]);
  const result = lesson ? getLessonResult(lesson.id) : null;
  const dateStr = new Date().toLocaleDateString();
  const certId = makeCertId(name, course);

  const [who, setWho] = useState(() => sp.get("name") || localStorage.getItem("rsq:cert:name") || "Learner");
const [qr, setQr] = useState(null);

// keep localStorage synced when user edits name
useEffect(() => {
  localStorage.setItem("rsq:cert:name", who);
}, [who]);

useEffect(() => {
  const url = `https://resqhub.example/verify?cert=${encodeURIComponent(certId)}&course=${encodeURIComponent(course)}&name=${encodeURIComponent(who)}`;
  QRCode.toDataURL(url, { width: 180, margin: 1 })
    .then(setQr)
    .catch(() => setQr(null));
}, [certId, course, who]);

  useEffect(() => {
    // celebratory confetti when arriving
    burst({ origin: { y: 0.3 }, particleCount: 180, spread: 80 });
  }, [burst]);

  const dlPNG = async () => {
    if (!ref.current) return;
    await downloadPNGFromNode(ref.current, `${course} - ${name}.png`);
  };
  const dlPDF = async () => {
    if (!ref.current) return;
    await downloadPDFFromNode(ref.current, `${course} - ${name}.pdf`);
  };

return (
  <div className="container-xxl page-gap">
    <div className="d-flex align-items-center justify-content-between mb-3">
      <h3 className="mb-0">Your Certificate</h3>
      <div className="d-flex align-items-center gap-2">
        <input
          className="form-control form-control-sm"
          style={{ width: 220 }}
          value={who}
          onChange={(e) => setWho(e.target.value)}
          placeholder="Your name"
          aria-label="Your name for certificate"
        />
        <button className="btn btn-outline-primary" onClick={dlPNG}>
          Download PNG
        </button>
        <button className="btn btn-outline-primary" onClick={dlPDF}>
          Download PDF
        </button>
        <Link className="btn btn-outline-secondary" to="/academy">
          Back
        </Link>
      </div>
    </div>

    {/* SINGLE certificate canvas (this is the one we capture via ref) */}
    <div className="cert-wrap">
      <div className="cert-canvas cert-paper" ref={ref}>
        <div className="cert-header">
          <div className="cert-brand">🏅 ResQHub Academy</div>
          <div className="cert-sub">Certificate of Completion</div>
        </div>

        <div className="cert-body">
          <div className="cert-line">This certifies that</div>
          <div className="cert-name">{who}</div>
          <div className="cert-line">has successfully completed</div>
          <div className="cert-course">{course}</div>

          {result && (
            <div className="cert-meta">
              <span>
                Score: <b>{result.score}%</b> •{" "}
              </span>
              <span>Status: {result.passed ? "Passed" : "Completed"}</span>
            </div>
          )}
        </div>

        <div className="cert-footer">
          <div className="cert-sign">
            {sign ? (
              <img src={sign} alt="Director signature" />
            ) : (
              <div className="cert-sign-fallback">Signature</div>
            )}
            <div className="cert-sign-caption">Director, ResQHub</div>
          </div>

          <div className="cert-qr">
            {qr ? <img src={qr} alt="Certificate verification QR" /> : <div className="cert-qr-fallback">QR</div>}
            <div className="cert-qr-caption">Scan to verify</div>
          </div>

          <div className="cert-info">
            <div>
              Issued on: <b>{dateStr}</b>
            </div>
            <div>
              Certificate ID: <b>{certId}</b>
            </div>
          </div>

          <div className="cert-seal">
            {seal ? <img src={seal} alt="Official seal" /> : <div className="cert-seal-fallback">SEAL</div>}
          </div>
        </div>
      </div>
    </div>
  </div>
);

}
