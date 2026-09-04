import { useState } from "react";

export default function ManualAddReport({ admin, onCreateReport, onAddLog }) {
  const [formData, setFormData] = useState({
    source: "",
    reportType: "",
    concernType: "",
    priority: "",
    residentName: "",
    contactNumber: "",
    location: "",
    description: "",
  });

  const emergencyConcerns = [
    "Flood Rescue",
    "Fire",
    "Medical Emergency",
    "Vehicle Accident",
    "Electrical Hazard",
    "Rescue Needed",
  ];

  const nonEmergencyConcerns = [
    "Infrastructure Concern",
    "Community Concern",
    "Service Request",
    "Other",
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConcernChange = (concern, type) => {
    setFormData((prev) => ({
      ...prev,
      concernType: concern,
      reportType: type,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.source) {
      alert("Please select the report source.");
      return;
    }

    if (!formData.concernType) {
      alert("Please select the incident or concern.");
      return;
    }

    if (!formData.priority) {
      alert("Please select the report priority.");
      return;
    }

    if (!formData.location) {
      alert("Please select the incident location.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please enter the incident details.");
      return;
    }

    const now = new Date();
    const dateSubmitted = now.toLocaleString("en-PH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newReport = {
      report_id: `RPT-${String(Date.now()).slice(-6)}`,

      report_type: formData.reportType,

      concern_type: formData.concernType,

      status: "Submitted",

      priority: formData.priority,

      verification_status: "Pending Verification",

      reporter_name: formData.residentName.trim() || "Not provided",

      reporter_contact: formData.contactNumber.trim() || "Not provided",

      location: formData.location,

      purok: formData.location,

      assigned_to: "",

      source: formData.source,

      description: formData.description.trim(),

      date_submitted: dateSubmitted,

      created_at: new Date().toISOString(),

      created_by: admin?.full_name || "Barangay Admin",
    };

    onCreateReport(newReport);

    onAddLog?.({
      log_id: `LOG-${Date.now()}`,
      report_id: newReport.report_id,
      action: "Manual Report Created",
      details: `Report ${newReport.report_id} (${newReport.concern_type}) created manually.`,
      performed_by: admin?.full_name || "Barangay Admin",
      timestamp: dateSubmitted,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* Page Heading */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">
            Manual Report Entry
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Quickly record a report received outside the resident app.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Report Source */}
          <section className="border-b border-slate-200">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="text-base font-bold text-slate-900">
                Report Source
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Select how the report was received.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 px-6 py-6 sm:grid-cols-5">
              {[
                "Phone Call",
                "Text / SMS",
                "Walk-in",
                "FB / Social Media",
                "Barangay Patrol",
              ].map((source) => {
                const selected = formData.source === source;

                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        source,
                      }))
                    }
                    className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                      selected
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {source}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Incident / Concern */}
          <section className="border-b border-slate-200">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="text-base font-bold text-slate-900">
                Incident / Concern
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Select the concern being reported.
              </p>
            </div>

            <div className="space-y-5 px-6 py-6">
              {/* Emergency */}
              <div>
                <p className="mb-2 text-sm font-semibold text-red-700">
                  Emergency
                </p>

                <div className="flex flex-wrap gap-2">
                  {emergencyConcerns.map((concern) => {
                    const selected = formData.concernType === concern;

                    return (
                      <button
                        key={concern}
                        type="button"
                        onClick={() =>
                          handleConcernChange(concern, "Emergency")
                        }
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          selected
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {concern}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Non-Emergency */}
              <div>
                <p className="mb-2 text-sm font-semibold text-blue-700">
                  Non-Emergency
                </p>

                <div className="flex flex-wrap gap-2">
                  {nonEmergencyConcerns.map((concern) => {
                    const selected = formData.concernType === concern;

                    return (
                      <button
                        key={concern}
                        type="button"
                        onClick={() =>
                          handleConcernChange(concern, "Non-Emergency")
                        }
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          selected
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {concern}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Priority */}
          <section className="border-b border-slate-200">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="text-base font-bold text-slate-900">Priority</h3>

              <p className="mt-1 text-sm text-slate-500">
                Set the initial priority for this report.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 px-6 py-6">
              {["High", "Medium", "Low"].map((priority) => {
                const selected = formData.priority === priority;

                let style =
                  "border-slate-300 bg-white text-slate-700 focus:border-blue-500 focus:ring-blue-500";

                if (selected && priority === "High") {
                  style = "border-red-500 bg-red-50 text-red-700";
                }

                if (selected && priority === "Medium") {
                  style = "border-orange-500 bg-orange-50 text-orange-700";
                }

                if (selected && priority === "Low") {
                  style = "border-green-500 bg-green-50 text-green-700";
                }

                return (
                  <button
                    key={priority}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        priority,
                      }))
                    }
                    className={`rounded-lg border px-5 py-2 text-sm font-semibold transition ${style}`}
                  >
                    {priority}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Reporter Information */}
          <section className="border-b border-slate-200">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="text-base font-bold text-slate-900">
                Reporter Information
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Enter the reporter's information, if available.
              </p>
            </div>

            <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="residentName"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Reporter Name
                </label>

                <input
                  id="residentName"
                  name="residentName"
                  type="text"
                  value={formData.residentName}
                  onChange={handleChange}
                  placeholder="Enter name if known"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="contactNumber"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Contact Number
                </label>

                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="e.g. 09123456789"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          {/* Incident Details */}
          <section>
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="text-base font-bold text-slate-900">
                Incident Details
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Provide the location and essential details.
              </p>
            </div>

            <div className="space-y-5 px-6 py-6">
              {/* Purok */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Incident Location
                </label>

                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="" disabled>
                    Select Purok
                  </option>

                  <option value="Purok 1">Purok 1</option>
                  <option value="Purok 2">Purok 2</option>
                  <option value="Purok 3">Purok 3</option>
                  <option value="Purok 4">Purok 4</option>
                  <option value="Purok 5">Purok 5</option>
                  <option value="Purok 6">Purok 6</option>
                  <option value="Purok 7">Purok 7</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Details
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Briefly describe the incident, current situation, and assistance needed..."
                  required
                  className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create Report
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
