export default function HomeTiles({ onNavigate }) {
  return (
    <section>
      <h2 className="rv-h2">How can I help you today?</h2>
      <p className="rv-sub">Choose an option below or just ask me with your voice</p>

      <div className="rv-grid">
        <div role="button" className="rv-tile rv-grad-talk" onClick={() => onNavigate("talk")}>
          <div className="rv-emoji">🧠💬</div>
          <div className="rv-t">Talk</div>
          <div className="rv-s">Chat with AI helper</div>
        </div>

        <div role="button" className="rv-tile rv-grad-calm" onClick={() => onNavigate("calm")}>
          <div className="rv-emoji">🫁🌬️</div>
          <div className="rv-t">Calm</div>
          <div className="rv-s">Breathing exercises</div>
        </div>

        <div role="button" className="rv-tile rv-grad-grief" onClick={() => onNavigate("grief")}>
          <div className="rv-emoji">💗</div>
          <div className="rv-t">Grief</div>
          <div className="rv-s">Gentle support</div>
        </div>

        <div role="button" className="rv-tile rv-grad-report" onClick={() => onNavigate("report")}>
          <div className="rv-emoji">🛟⚠️</div>
          <div className="rv-t">Report</div>
          <div className="rv-s">Emergency help</div>
        </div>
      </div>
    </section>
  );
}
