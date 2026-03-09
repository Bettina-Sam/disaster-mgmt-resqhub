import React from "react";

export default function ExportCSV({ items }) {
  const onExport = () => {
    const rows = [
      ["Title","Type","Severity","Status","Address","Lat","Lng","Reporter","Created At"],
      ...items.map(e => [
        e.title,
        e.type,
        e.severity,
        e.status,
        e.address || "",
        e.location?.lat ?? "",
        e.location?.lng ?? "",
        e.reportedBy || "",
        new Date(e.createdAt).toLocaleString(),
      ])
    ];
    const csv = rows.map(r => r.map(v => {
      const s = String(v).replaceAll('"','""');
      return `"${s}"`;
    }).join(",")).join("\r\n");

    // Add BOM so Excel opens UTF-8 correctly
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `disaster_reports_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mb-3 d-flex justify-content-end">
      <button className="btn btn-outline-secondary" onClick={onExport}>
        Export CSV
      </button>
    </div>
  );
}
