const SOS_REASON_LABELS = {
  fire: "Fire / Smoke",
  flood: "Flood / Trapped",
  medical: "Medical Emergency",
  accident: "Road Accident / Obstruction Danger",
  violence: "Violence / Safety Threat",
  other: "Other / Unable to Describe",
};

function humanizeValue(value) {
  return String(value || "")
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export function getSosReasonLabel(report) {
  if (!report) {
    return null;
  }

  const directReason =
    report.sos_reason ??
    report.sosReason ??
    report.quick_reason ??
    report.quickReason ??
    report.sos?.reason ??
    null;

  if (directReason) {
    const normalized =
      String(directReason)
        .trim()
        .toLowerCase();

    return (
      SOS_REASON_LABELS[normalized] ||
      humanizeValue(directReason)
    );
  }

  /*
   * Compatibility fallback for existing SOS records.
   * Existing descriptions can contain:
   * "Quick reason: Medical Emergency."
   */
  const description =
    String(report.description || "");

  const match =
    description.match(
      /quick reason:\s*([^.\n]+)/i,
    );

  if (match?.[1]) {
    return match[1].trim();
  }

  return null;
}

export function isSosReportLike(report) {
  if (!report) {
    return false;
  }

  const concernCode =
    String(
      report.concern_code ??
      report.concernCode ??
      "",
    )
      .trim()
      .toLowerCase();

  const type =
    String(
      report.report_type ??
      report.type ??
      "",
    )
      .trim()
      .toLowerCase();

  const category =
    String(report.category || "")
      .trim()
      .toLowerCase();

  const description =
    String(report.description || "")
      .trim()
      .toLowerCase();

  return (
    concernCode === "sos" ||
    type.includes("sos") ||
    category.includes("sos") ||
    description.startsWith("sos submitted")
  );
}

/*
 * Category answers:
 * "What kind of SOS/emergency is this?"
 *
 * Example:
 * Medical Emergency
 */
export function getReportCategoryLabel(report) {
  if (!report) {
    return "Not available";
  }

  if (isSosReportLike(report)) {
    return (
      getSosReasonLabel(report) ||
      "Emergency"
    );
  }

  return (
    report.category ||
    report.report_type ||
    report.type ||
    "Not available"
  );
}

/*
 * Display title answers:
 * "What kind of report is this?"
 *
 * Example:
 * SOS — Medical Emergency
 */
export function getReportDisplayTitle(report) {
  if (!report) {
    return "Emergency Report";
  }

  if (isSosReportLike(report)) {
    const reason =
      getSosReasonLabel(report);

    return reason
      ? `SOS — ${reason}`
      : "SOS Emergency";
  }

  return (
    report.type ||
    report.category ||
    report.report_type ||
    "Emergency Report"
  );
}