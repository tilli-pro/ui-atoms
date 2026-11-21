import { numberRange, tenantOf, weights } from "../common.js";
import { moneyFrom } from "../money.js";
import {
  emailFor,
  organizationsByIndustry,
  personName,
  phone,
} from "../names.js";
import { ANCHOR, createRng, seedFor } from "../random.js";
import { formsShape, submissionsShape } from "../shapes/engage.js";
import { between, COUNTS, kebab, lookup, uniqueNames } from "./common.js";
import type { Persona } from "../../specs/types.js";
import type { SourceTenant } from "../shapes/types.js";
import type {
  EngageForm,
  EngageSubmission,
  FormStatus,
  SubmissionStatus,
} from "./types.js";

export const FORM_TOPICS = [
  "Hardship assistance",
  "Autopay enrollment",
  "Service start",
  "Service transfer",
  "Permit",
  "Rebate",
  "Payment arrangement",
  "Billing dispute",
  "Paperless billing",
  "Medical certificate",
  "Water restriction waiver",
  "Merchant onboarding",
  "Developer access",
  "Card enrollment",
  "Fee waiver",
  "Public records",
  "Grant intake",
  "Contractor registration",
  "Meter test",
  "Reconnection",
  "Energy audit",
  "Senior discount",
  "Business account",
  "Name change",
];

export const genForms = (persona: Persona): EngageForm[] => {
  const rng = createRng(seedFor(persona, "engage.forms"));
  const e = formsShape.enums;
  const tenant = tenantOf<SourceTenant>(formsShape, persona.key);
  const window = formsShape.dates as { fromDaysAgo: number; toDaysAgo: number };
  const counts = numberRange(
    formsShape,
    tenant === "U1" ? "total_submissions_U1" : "total_submissions",
  );
  const names = uniqueNames(
    rng,
    FORM_TOPICS,
    [" application", " enrollment form", " request"],
    COUNTS.forms,
  );
  const rows = names.map((name, i): EngageForm => {
    const status = rng.weighted(lookup<FormStatus>(e, "status", tenant));
    const submissions = Math.round(moneyFrom(rng, counts));
    const approved = Math.round(
      submissions * rng.range({ min: 0, median: 0.3, max: 0.7 }),
    );
    const rejected = Math.round(
      (submissions - approved) * rng.range({ min: 0, median: 0.15, max: 0.5 }),
    );
    const live = status === "published" || status === "paused";
    return {
      id: `form-${i + 1}`,
      name,
      type: rng.weighted(lookup<string>(e, "type", tenant)),
      status,
      submissions,
      approved,
      rejected,
      listedPublic:
        status === "published" &&
        tenant === "G1" &&
        rng.weighted(lookup<string>(e, "listed_public", tenant)) === "true",
      createdAt: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
      publicUrl: live ? `https://forms.example.org/f/${kebab(name)}` : null,
    };
  });
  return rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const genSubmissions = (
  persona: Persona,
  forms: EngageForm[],
): EngageSubmission[] => {
  const rng = createRng(seedFor(persona, "engage.submissions"));
  const e = submissionsShape.enums;
  const window = submissionsShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const open = forms.filter(
    (f) => f.status === "published" || f.status === "paused",
  );
  const pool = open.length ? open : forms;
  const orgs = organizationsByIndustry[persona.key];
  const rows = Array.from(
    { length: COUNTS.submissions },
    (_, i): EngageSubmission => {
      const form = rng.pick(pool);
      const status = rng.weighted(weights<SubmissionStatus>(e, "status"));
      const kind = rng.weighted(weights<string>(e, "submitter"));
      const org = rng.pick(orgs);
      const person = personName(rng);
      const applicant =
        kind === "person"
          ? person
          : kind === "organization"
            ? org
            : `Anonymous #${String(rng.int(0, 99999999)).padStart(8, "0")}`;
      const raw = rng.daysAgo(window.fromDaysAgo, window.toDaysAgo);
      const submittedAt =
        raw.getTime() < form.createdAt.getTime()
          ? between(rng, form.createdAt, ANCHOR)
          : raw;
      return {
        id: `submission-${i + 1}`,
        applicant,
        email:
          kind === "anonymous" || rng.bool(0.03)
            ? null
            : emailFor(kind === "person" ? person : "Office Contact", org),
        formId: form.id,
        form: form.name,
        contact: rng.bool(0.05) ? null : phone(rng),
        status,
        source: rng.weighted(weights<string>(e, "source")),
        submittedAt,
        amountDue:
          status === "pending_payment"
            ? moneyFrom(rng, numberRange(submissionsShape, "amount"))
            : null,
      };
    },
  );
  return rows.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
};
