import { useState } from "react";

export default function MarkAsResolved() {
  const [resolved, setResolved] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setResolved(true);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ResQNow</h1>

            <p className="text-sm text-slate-500">Barangay Web Admin System</p>
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              Barangay Admin
            </p>

            <p className="text-xs text-slate-500">Mark as Resolved</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Mark as Resolved</h2>

          <p className="mt-1 text-sm text-slate-500">
            Record the resolution of a barangay report.
          </p>
        </div>

        {/* Success Message */}
        {resolved && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <p className="text-sm font-semibold text-green-700">
              Report marked as resolved successfully.
            </p>

            <p className="mt-1 text-sm text-green-600">
              The resolution record is currently using mock data.
            </p>
          </div>
        )}

        {/* Report Summary */}
        <section className="mb-6 rounded-xl bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h3 className="text-lg font-bold text-slate-900">Report Summary</h3>

            <p className="mt-1 text-sm text-slate-500">
              Review the report before recording its resolution.
            </p>
          </div>

          <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Report ID
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                RPT-001
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Current Status
              </p>

              <span className="mt-1 inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                In Progress
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Concern
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                Flood Rescue Needed
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assigned To
              </p>

              <p className="mt-1 text-sm text-slate-700">Responder One</p>
            </div>
          </div>
        </section>

        {/* Resolution Form */}
        <section className="rounded-xl bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h3 className="text-lg font-bold text-slate-900">
              Resolution Details
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Enter the date, time, and remarks for the completed report.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5 px-6 py-6">
              {/* Date */}
              <div>
                <label
                  htmlFor="resolvedDate"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Resolution Date
                </label>

                <input
                  id="resolvedDate"
                  type="date"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label
                  htmlFor="resolvedTime"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Resolution Time
                </label>

                <input
                  id="resolvedTime"
                  type="time"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              {/* Remarks */}
              <div>
                <label
                  htmlFor="remarks"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Resolution Remarks
                </label>

                <textarea
                  id="remarks"
                  rows="5"
                  placeholder="Enter remarks describing how the report was resolved..."
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                ></textarea>
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-end border-t px-6 py-5">
              <button
                type="submit"
                className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                Mark as Resolved
              </button>
            </div>
          </form>
        </section>

        {/* Mock Data Notice */}
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
          <p className="text-sm font-semibold text-yellow-800">Mock Data</p>

          <p className="mt-1 text-sm text-yellow-700">
            Resolution details are currently displayed and handled on the screen
            only. Actual database updating will be implemented during API
            integration.
          </p>
        </div>
      </main>
    </div>
  );
}

