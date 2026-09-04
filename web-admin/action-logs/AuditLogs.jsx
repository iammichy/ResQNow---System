export default function AuditLogs({ logs = [] }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex min-h-[132px] max-w-sm flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">
                Total Log Entries
              </p>

              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            </div>

            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {logs.length}
            </p>
          </div>
        </div>

        {/* Activity History */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-lg font-bold text-slate-900">
              Activity History
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Administrative actions recorded by the system.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                No audit logs available.
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={log.log_id || `LOG-${index}`} className="px-6 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {log.log_id || `LOG-${index + 1}`}
                        </span>

                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {log.action || "System Activity"}
                        </span>
                      </div>

                      {log.details && (
                        <p className="mt-2 text-sm text-slate-700">
                          {log.details}
                        </p>
                      )}

                      <div className="mt-3 space-y-1 text-sm text-slate-600">
                        {log.report_id && (
                          <p>
                            <span className="font-medium">Report:</span>{" "}
                            {log.report_id}
                          </p>
                        )}

                        <p>
                          <span className="font-medium">Performed by:</span>{" "}
                          {log.performed_by || "Barangay Admin"}
                        </p>

                        {log.status && (
                          <p>
                            <span className="font-medium">Status:</span>{" "}
                            {log.status}
                          </p>
                        )}

                        <p>
                          <span className="font-medium">Date / Time:</span>{" "}
                          {log.timestamp || "Not recorded"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
