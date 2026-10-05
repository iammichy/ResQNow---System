<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportEvidenceController extends Controller
{
    /**
     * Serve Resident-submitted report evidence from private storage.
     *
     * Access is granted through a short-lived signed URL generated only
     * inside an authorized report response. Files are not stored under
     * public/storage and are never exposed through a permanent public URL.
     */
    public function show(
        Request $request,
        string $reportCode
    ): BinaryFileResponse {
        abort_unless(
            $request->hasValidSignature(),
            403,
            'This evidence link is invalid or has expired.'
        );

        $report = Report::query()
            ->where('report_code', $reportCode)
            ->firstOrFail();

        abort_unless(
            ! empty($report->photo_path),
            404,
            'No evidence is attached to this report.'
        );

        $disk = $report->photo_disk ?: 'local';

        /*
         * New and migrated Resident evidence must live on the private
         * local disk. Do not silently fall back to public storage.
         */
        abort_unless(
            $disk === 'local',
            404,
            'The requested evidence is not available from private storage.'
        );

        abort_unless(
            Storage::disk('local')->exists($report->photo_path),
            404,
            'The requested evidence file was not found.'
        );

        $absolutePath =
            Storage::disk('local')->path($report->photo_path);

        $mimeType =
            Storage::disk('local')->mimeType($report->photo_path)
            ?: 'application/octet-stream';

        return response()->file(
            $absolutePath,
            [
                'Content-Type' => $mimeType,
                'Cache-Control' => 'private, no-store, max-age=0',
                'Pragma' => 'no-cache',
                'X-Content-Type-Options' => 'nosniff',
                'Referrer-Policy' => 'no-referrer',
            ]
        );
    }
}