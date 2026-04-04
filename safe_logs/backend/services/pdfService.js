import PDFDocument from "pdfkit";

export const generatePDF = (logs, res) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  // Title
  doc.fontSize(20).text("SAFE System Incident Report", {
    align: "center",
  });

  doc.moveDown();

  logs.forEach((log, i) => {
    doc.fontSize(14).text(`Log #${i + 1}`, { underline: true });

    doc.fontSize(11);

    doc.text(`System ID: ${log.system_id}`);
    doc.text(`Floor: ${log.floor_id}`);
    doc.text(`Mode: ${log.system_mode}`);
    doc.text(`Status: ${log.meta?.system_status}`);

    doc.text(`Timestamp: ${log.timestamp}`);
    doc.text(`Latency: ${log.meta?.latency_ms} ms`);

    doc.moveDown();

    doc.text("Occupancy:");
    doc.text(
      `  Before: ${log.occupancy?.people_before}, Current: ${log.occupancy?.current_people}`,
    );

    doc.moveDown();

    doc.text("Evacuation:");
    doc.text(`  Active Path: ${log.evacuation?.active_path_id}`);
    doc.text(`  Path Length: ${log.evacuation?.path_length}`);

    doc.moveDown();

    doc.text("Nodes:");
    doc.text(`  Total Nodes: ${log.meta?.total_nodes}`);

    doc.moveDown();
    doc.text("--------------------------------------------------");
    doc.moveDown();
  });

  doc.end();
};
