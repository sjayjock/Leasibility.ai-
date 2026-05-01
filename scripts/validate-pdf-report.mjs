import { writeFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { appRouter } from '../server/routers.ts';

const projectId = Number(process.argv[2] ?? '13');
const ctx = {
  user: {
    id: 1,
    openId: 'validation-user',
    email: 'validation@example.invalid',
    name: 'Validation User',
    loginMethod: 'manus',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {
    protocol: 'https',
    headers: {
      origin: 'https://leasestage-htnkotpf.manus.space',
    },
  },
  res: {
    clearCookie() {},
  },
};

const caller = appRouter.createCaller(ctx);
const result = await caller.pdf.generateReport({ projectId });
const html = result.html ?? '';
const checks = {
  projectId,
  hasUrl: Boolean(result.url),
  url: result.url,
  htmlLength: html.length,
  containsProjectName: html.includes('Staging Validation Floor Plan'),
  containsLightRefresh: html.includes('Light Refresh'),
  containsModerateBuildOut: html.includes('Moderate Build-Out'),
  containsFullTransformation: html.includes('Full Transformation'),
  containsBudget: /Budget|Estimated Budget|\$/.test(html),
  containsSchedule: /Schedule|weeks|wks/i.test(html),
  containsDisclaimer: /AI-generated estimates are approximations/i.test(html),
  containsParserReviewRequired: /PARSER REVIEW REQUIRED/i.test(html),
  containsNeedsReview: /\bNeeds Review\b/i.test(html),
  containsSoftwareFailure: /software failure/i.test(html),
};
mkdirSync('docs/validation/deployed-2026-05-01', { recursive: true });
writeFileSync(
  'docs/validation/deployed-2026-05-01/pdf-report-validation.json',
  `${JSON.stringify(checks, null, 2)}\n`
);
console.log(JSON.stringify(checks, null, 2));
if (checks.containsParserReviewRequired || checks.containsNeedsReview || checks.containsSoftwareFailure) {
  process.exitCode = 1;
}
