import React from "react";

export default function ThemeToggle() {
  // Default to dark mode for the showcase, ignoring previous session choices
  const [dark, setDark] = React.useState(true);

  React.useEffect(() => {
    // Force dark theme on mount to ensure consistency, then allow toggle
    document.documentElement.setAttribute("data-bs-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      type="button"
      className="btn btn-sm btn-outline-secondary"
      onClick={() => setDark((d) => !d)}
      title="Toggle theme"
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}
