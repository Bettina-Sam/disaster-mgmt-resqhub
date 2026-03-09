import React from "react";
import html2canvas from "html2canvas";

export default function ExportPNG({
  targetId = "capture-root",
  filename = "ResQHub-dashboard.png",
}) {
  const onClick = async () => {
    const el = document.getElementById(targetId);
    if (!el) return alert("Capture area not found");
    const canvas = await html2canvas(el, {
      scale: 2,          // sharper export
      useCORS: true,
      backgroundColor: null,
      logging: false,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    });
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <button type="button" className="btn btn-outline-secondary ms-2" onClick={onClick}>
      Export PNG
    </button>
  );
}
