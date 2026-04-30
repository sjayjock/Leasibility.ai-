import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { projects, scenarios, brokerProfiles } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// Format currency
function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

// Build the HTML for the branded PDF report
function buildReportHtml(
  project: typeof projects.$inferSelect,
  scenarioList: (typeof scenarios.$inferSelect)[],
  broker: typeof brokerProfiles.$inferSelect | null
): string {
  const impactColors: Record<string, string> = {
    low: "#22c55e",
    medium: "#D4AF37",
    high: "#ef4444",
  };

  const impactLabels: Record<string, string> = {
    low: "Light Refresh",
    medium: "Moderate Build-Out",
    high: "Full Transformation",
  };

  const scenariosHtml = scenarioList.map((s) => {
    const color = impactColors[s.impactLevel] ?? "#D4AF37";
    const label = impactLabels[s.impactLevel] ?? s.label;
    // budgetBreakdown is stored as an object {construction:{low,mid,high}, ffe:{...}, ...} — convert to array safely
    const rawBreakdown = s.budgetBreakdown as Record<string, { low: number; mid: number; high: number }> | null;
    const breakdownLabels: Record<string, string> = {
      construction: "Construction",
      ffe: "FF&E (Furniture, Fixtures & Equipment)",
      itAv: "IT / AV (Technology & Audio-Visual)",
      softCosts: "Soft Costs (Design, Permits, etc.)",
      tiAllowance: "TI Allowance Credit",
    };
    const breakdown: Array<{ category: string; low: number; mid: number; high: number }> = rawBreakdown && typeof rawBreakdown === "object" && !Array.isArray(rawBreakdown)
      ? Object.entries(rawBreakdown).map(([key, val]) => ({
          category: breakdownLabels[key] ?? key,
          low: val?.low ?? 0,
          mid: val?.mid ?? 0,
          high: val?.high ?? 0,
        }))
      : Array.isArray(rawBreakdown) ? (rawBreakdown as Array<{ category: string; low: number; mid: number; high: number }>)
      : [];
    const phases = (s.schedulePhases as Array<{ phase: string; weeks: string | number; description: string }>) ?? [];
    const programFit = s.programFit as { achievedPercent: number; interpretation: string; rows: Array<{ programItem: string; requested: number; achieved: number; variance: number; fitStatus: string; notes: string }> } | null;
    const renderingStatus = s.renderingStatus as { status: "ready" | "needs_review"; message: string } | null;

    const breakdownRows = breakdown.map(b => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${b.category}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmt(b.low)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmt(b.mid)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmt(b.high)}</td>
      </tr>`).join("");

    const phaseRows = phases.map((p, i) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;">${i + 1}. ${p.phase}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center;">${p.weeks} wks</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">${p.description}</td>
      </tr>`).join("");

    const roomRows = ((s.roomBreakdown as Array<{ type: string; count: number; sqFt: number }>) ?? [])
      .map(r => `<li style="margin-bottom:4px;">${r.count}x ${r.type} (${r.sqFt.toLocaleString()} sq ft)</li>`).join("");

    const programRows = programFit?.rows?.map(row => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;color:#374151;">${row.programItem}<div style="font-size:10px;color:#9ca3af;">${row.notes}</div></td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;color:#6b7280;">${row.requested}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;color:#111827;">${row.achieved}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-transform:uppercase;font-size:10px;color:${row.fitStatus === "met" || row.fitStatus === "surplus" ? "#047857" : row.fitStatus === "partial" ? "#b45309" : "#b91c1c"};">${row.fitStatus.replace("_", " ")}</td>
      </tr>`).join("") ?? "";

    return `
    <div style="page-break-before:always;padding:40px;">
      <!-- Scenario Header -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
        <div style="width:6px;height:48px;background:${color};border-radius:3px;"></div>
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${color};">Scenario ${s.scenarioNumber}</div>
          <div style="font-size:22px;font-weight:800;color:#0F1F3D;">${label}</div>
        </div>
      </div>

      <!-- Key Metrics Row -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;">
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#0F1F3D;">${s.efficiencyScore}%</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">Efficiency Score</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#0F1F3D;">${(s.usableSqFt ?? 0).toLocaleString()}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">Usable Sq Ft</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:20px;font-weight:800;color:#0F1F3D;">${fmt(s.budgetLow ?? 0)}–${fmt(s.budgetHigh ?? 0)}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">Budget Range</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#0F1F3D;">${s.scheduleWeeksMid ?? 0} wks</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">Est. Timeline</div>
        </div>
      </div>

      <!-- Deterministic Layout -->
      ${s.layoutSvg ? `
      <div style="margin-bottom:32px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:#f8fafc;padding:16px;">
        <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Space Layout — Architectural Renderer</div>
        ${renderingStatus?.status === "needs_review" ? `<div style="background:#fffbeb;border:1px solid #f59e0b;color:#92400e;border-radius:6px;padding:8px;font-size:11px;margin-bottom:12px;">${renderingStatus.message}</div>` : ""}
        ${s.layoutSvg}
      </div>` : ""}

      <!-- Program Fit -->
      ${programRows ? `
      <div style="margin-bottom:32px;">
        <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Program Fit — ${programFit?.achievedPercent ?? 0}%</div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead><tr style="background:#0F1F3D;color:white;"><th style="padding:8px;text-align:left;">Program</th><th style="padding:8px;text-align:right;">Requested</th><th style="padding:8px;text-align:right;">Achieved</th><th style="padding:8px;text-align:left;">Status</th></tr></thead>
          <tbody>${programRows}</tbody>
        </table>
        <p style="font-size:11px;color:#6b7280;line-height:1.5;">${programFit?.interpretation ?? ""}</p>
      </div>` : ""}

      <!-- AI Summary -->
      <div style="margin-bottom:32px;background:#f0f4ff;border-left:4px solid ${color};padding:16px;border-radius:0 8px 8px 0;">
        <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">AI Analysis</div>
        <p style="font-size:13px;color:#374151;line-height:1.6;margin:0;">${s.aiSummary ?? ""}</p>
      </div>

      <!-- Room Breakdown -->
      ${roomRows ? `
      <div style="margin-bottom:32px;">
        <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Program Breakdown</div>
        <ul style="list-style:none;padding:0;margin:0;columns:2;font-size:13px;color:#374151;">${roomRows}</ul>
      </div>` : ""}

      <!-- Budget Breakdown -->
      ${breakdownRows ? `
      <div style="margin-bottom:32px;">
        <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Budget Breakdown</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#0F1F3D;color:white;">
              <th style="padding:8px;text-align:left;">Category</th>
              <th style="padding:8px;text-align:right;">Low</th>
              <th style="padding:8px;text-align:right;">Mid</th>
              <th style="padding:8px;text-align:right;">High</th>
            </tr>
          </thead>
          <tbody>${breakdownRows}</tbody>
        </table>
      </div>` : ""}

      <!-- Schedule -->
      ${phaseRows ? `
      <div>
        <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Project Schedule</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#0F1F3D;color:white;">
              <th style="padding:8px;text-align:left;">Phase</th>
              <th style="padding:8px;text-align:center;">Duration</th>
              <th style="padding:8px;text-align:left;">Description</th>
            </tr>
          </thead>
          <tbody>${phaseRows}</tbody>
        </table>
        <div style="margin-top:8px;font-size:11px;color:#9ca3af;">
          Total estimated timeline: ${s.scheduleWeeksLow}–${s.scheduleWeeksHigh} weeks (${Math.round((s.scheduleWeeksLow ?? 0) / 4.3)}–${Math.round((s.scheduleWeeksHigh ?? 0) / 4.3)} months)
        </div>
      </div>` : ""}
    </div>`;
  }).join("");

  const brokerSection = broker ? `
    <div style="display:flex;align-items:center;gap:16px;margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
      ${broker.brokerPhotoUrl ? `<img src="${broker.brokerPhotoUrl}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;" />` : ""}
      <div>
        <div style="font-weight:700;color:#0F1F3D;font-size:15px;">${broker.brokerName ?? ""}</div>
        <div style="color:#6b7280;font-size:13px;">${broker.brokerTitle ?? ""} ${broker.brokerCompany ? `· ${broker.brokerCompany}` : ""}</div>
        <div style="color:#6b7280;font-size:13px;">${broker.brokerPhone ?? ""} ${broker.brokerEmail ? `· ${broker.brokerEmail}` : ""}</div>
      </div>
      ${broker.brokerLogoUrl ? `<img src="${broker.brokerLogoUrl}" style="height:40px;margin-left:auto;object-fit:contain;" />` : ""}
    </div>` : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; background: white; }
    @page { margin: 0; }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div style="min-height:100vh;background:linear-gradient(135deg,#0F1F3D 0%,#1A2B4A 100%);display:flex;flex-direction:column;justify-content:space-between;padding:60px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#D4AF37;margin-bottom:8px;">Space Feasibility Report</div>
        <div style="font-size:36px;font-weight:800;color:white;line-height:1.2;">${project.propertyName}</div>
        ${project.propertyAddress ? `<div style="font-size:16px;color:rgba(255,255,255,0.6);margin-top:8px;">${project.propertyAddress}</div>` : ""}
        ${project.floorNumber ? `<div style="font-size:14px;color:rgba(255,255,255,0.5);margin-top:4px;">Floor ${project.floorNumber}</div>` : ""}
      </div>
      ${broker?.brokerLogoUrl ? `<img src="${broker.brokerLogoUrl}" style="height:48px;object-fit:contain;filter:brightness(0) invert(1);" />` : ""}
    </div>

    <div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:48px;">
        <div>
          <div style="font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Total Area</div>
          <div style="font-size:22px;font-weight:700;color:white;">${(project.totalSqFt ?? 0).toLocaleString()} sq ft</div>
        </div>
        <div>
          <div style="font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Headcount</div>
          <div style="font-size:22px;font-weight:700;color:white;">${project.headcount ?? "—"} people</div>
        </div>
        <div>
          <div style="font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Market</div>
          <div style="font-size:22px;font-weight:700;color:white;">${project.market ?? project.city ?? "—"}</div>
        </div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:24px;">
        <div style="font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">3 Scenarios Included</div>
        <div style="display:flex;gap:16px;">
          <div style="display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:50%;background:#22c55e;"></div><span style="color:rgba(255,255,255,0.7);font-size:13px;">Light Refresh</span></div>
          <div style="display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:50%;background:#D4AF37;"></div><span style="color:rgba(255,255,255,0.7);font-size:13px;">Moderate Build-Out</span></div>
          <div style="display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:50%;background:#ef4444;"></div><span style="color:rgba(255,255,255,0.7);font-size:13px;">Full Transformation</span></div>
        </div>
      </div>

      ${brokerSection}

      <div style="margin-top:24px;font-size:10px;color:rgba(255,255,255,0.25);">
        Prepared by Leasibility AI · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · AI-generated estimates are approximations for feasibility only, not professional contractor bids.
      </div>
    </div>
  </div>

  ${scenariosHtml}
</body>
</html>`;
}

export const pdfRouter = router({
  generateReport: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Fetch project
      const projectResult = await db.select().from(projects)
        .where(eq(projects.id, input.projectId)).limit(1);
      const project = projectResult[0];
      if (!project || project.userId !== ctx.user.id) throw new Error("Project not found");

      // Fetch scenarios
      const scenarioList = await db.select().from(scenarios)
        .where(eq(scenarios.projectId, input.projectId));

      // Fetch broker profile
      const brokerResult = await db.select().from(brokerProfiles)
        .where(eq(brokerProfiles.userId, ctx.user.id)).limit(1);
      const broker = brokerResult[0] ?? null;

      // Build HTML
      const html = buildReportHtml(project, scenarioList, broker);

      // Store HTML as a report file in S3 (PDF generation via browser print)
      const key = `reports/${ctx.user.id}/${input.projectId}-${nanoid(8)}.html`;
      const { url } = await storagePut(key, Buffer.from(html, "utf-8"), "text/html");

      return { url, html };
    }),
});
