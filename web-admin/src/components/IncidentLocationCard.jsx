import {
  ExternalLink,
  MapPin,
  Navigation,
} from "lucide-react";

function numberOrNull(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function sourceLabel(source) {
  switch (
    String(source || "")
      .trim()
      .toLowerCase()
  ) {
    case "gps":
      return "Device GPS";

    case "manual":
      return "Resident-provided / pinned";

    case "saved":
      return "Registered address fallback";

    default:
      return "Not recorded";
  }
}

function formatCaptured(value) {
  if (!value) {
    return "Not recorded";
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? String(value)
    : date.toLocaleString();
}

export default function IncidentLocationCard({
  report,
}) {
  const latitude =
    numberOrNull(
      report?.latitude
    );

  const longitude =
    numberOrNull(
      report?.longitude
    );

  const hasCoordinates =
    latitude !== null &&
    longitude !== null;

  const source =
    report?.locationSource ??
    report?.location_source ??
    null;

  const sourceKey =
    String(source || "")
      .trim()
      .toLowerCase();

  const accuracy =
    numberOrNull(
      report?.locationAccuracy ??
      report?.location_accuracy
    );

  const captured =
    report?.locationCapturedAt ??
    report?.location_captured_at ??
    null;

  let embedUrl =
    null;

  let openMapUrl =
    null;

  let directionsUrl =
    null;

  if (hasCoordinates) {
    const latSpan =
      0.003;

    const lngSpan =
      0.004;

    const bbox = [
      longitude - lngSpan,
      latitude - latSpan,
      longitude + lngSpan,
      latitude + latSpan,
    ].join(",");

    embedUrl =
      "https://www.openstreetmap.org/export/embed.html" +
      `?bbox=${encodeURIComponent(bbox)}` +
      "&layer=mapnik" +
      `&marker=${latitude}%2C${longitude}`;

    openMapUrl =
      "https://www.openstreetmap.org/" +
      `?mlat=${latitude}&mlon=${longitude}` +
      `#map=18/${latitude}/${longitude}`;

    directionsUrl =
      "https://www.google.com/maps/dir/" +
      `?api=1&destination=${latitude},${longitude}`;
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[#E4E7EC] bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-[#E4E7EC] px-5 py-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#1F5FA6]">
            Incident Location
          </p>

          <h2 className="mt-1 text-sm font-bold text-[#101C2E]">
            Location provided for this emergency
          </h2>

          <p className="mt-1 text-xs text-[#667085]">
            Submitted incident location — not live resident tracking.
          </p>
        </div>

        <MapPin className="h-5 w-5 shrink-0 text-[#D92D20]" />
      </div>

      {sourceKey === "saved" && (
        <div className="border-b border-[#FEDF89] bg-[#FFFAEB] px-5 py-3">
          <p className="text-xs font-bold text-[#B54708]">
            Registered address fallback
          </p>

          <p className="mt-1 text-[11px] leading-relaxed text-[#7A2E0E]">
            This is the resident's registered location, not confirmed current
            GPS. Confirm the actual incident location when possible.
          </p>
        </div>
      )}

      {sourceKey === "manual" && (
        <div className="border-b border-[#B2DDFF] bg-[#EFF8FF] px-5 py-3">
          <p className="text-xs font-bold text-[#175CD3]">
            Resident-provided incident location
          </p>

          <p className="mt-1 text-[11px] leading-relaxed text-[#344054]">
            The resident manually entered and/or pinned this location.
          </p>
        </div>
      )}

      <div className="p-5">
        <p className="text-sm font-semibold text-[#344054]">
          {report?.location ||
            "Location not provided"}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] p-3">
            <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
              Source
            </p>

            <p className="mt-1 text-xs font-bold text-[#344054]">
              {sourceLabel(
                source
              )}
            </p>
          </div>

          <div className="rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] p-3">
            <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
              Accuracy
            </p>

            <p className="mt-1 text-xs font-bold text-[#344054]">
              {accuracy !== null
                ? `±${Math.round(
                    accuracy
                  )} m`
                : "Not available"}
            </p>
          </div>

          <div className="rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] p-3">
            <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
              Captured
            </p>

            <p className="mt-1 text-xs font-bold text-[#344054]">
              {formatCaptured(
                captured
              )}
            </p>
          </div>

          <div className="rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] p-3">
            <p className="text-[10px] font-bold uppercase text-[#98A2B3]">
              Coordinates
            </p>

            <p className="mt-1 break-all text-xs font-bold text-[#344054]">
              {hasCoordinates
                ? `${latitude.toFixed(
                    6
                  )}, ${longitude.toFixed(
                    6
                  )}`
                : "Not provided"}
            </p>
          </div>
        </div>

        {hasCoordinates ? (
          <>
            <div className="mt-4 h-[280px] overflow-hidden rounded-xl border border-[#E4E7EC] bg-[#F2F4F7]">
              <iframe
                title={`Incident location for ${
                  report?.id ||
                  "report"
                }`}
                src={embedUrl}
                loading="lazy"
                className="h-full w-full border-0"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={openMapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-3 text-xs font-semibold text-[#344054]"
              >
                <ExternalLink className="h-4 w-4" />
                Open Map
              </a>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#1F5FA6] px-3 text-xs font-semibold text-white"
              >
                <Navigation className="h-4 w-4" />
                Get Directions
              </a>
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-[#D0D5DD] bg-[#F8FAFC] px-4 py-5 text-center">
            <MapPin className="mx-auto h-5 w-5 text-[#98A2B3]" />

            <p className="mt-2 text-xs font-semibold text-[#475467]">
              No map coordinates were provided.
            </p>

            <p className="mt-1 text-[11px] text-[#667085]">
              Use the written incident location and contact the resident if
              clarification is needed.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}