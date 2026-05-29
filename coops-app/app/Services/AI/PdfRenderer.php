<?php

namespace App\Services\AI;

/**
 * Renders a PDF file to one JPEG image per page using Ghostscript.
 * Writes the JPEGs to a temp directory and returns their absolute paths.
 *
 * Returns an empty array on failure (logged via error_log).
 */
class PdfRenderer
{
    /** Cap on pages we send to vision per document. */
    public const MAX_PAGES = 4;

    /** Render DPI. 150 is a good balance between OCR accuracy and file size. */
    public const DPI = 150;

    /**
     * @return string[] absolute paths to the rendered JPEG files
     */
    public static function renderPages(string $absPdfPath, int $maxPages = self::MAX_PAGES): array
    {
        if (!is_file($absPdfPath)) return [];

        $gs = trim((string) shell_exec('command -v gs 2>/dev/null'));
        if ($gs === '') {
            error_log('PdfRenderer: ghostscript (gs) not installed');
            return [];
        }

        $tmpDir = rtrim(sys_get_temp_dir(), '/') . '/ai-pdf-' . bin2hex(random_bytes(6));
        if (!@mkdir($tmpDir, 0700, true)) {
            error_log("PdfRenderer: could not create temp dir {$tmpDir}");
            return [];
        }

        $out = $tmpDir . '/page-%03d.jpg';
        $cmd = sprintf(
            '%s -dNOPAUSE -dBATCH -dQUIET -sDEVICE=jpeg -r%d -dJPEGQ=85 -dFirstPage=1 -dLastPage=%d -sOutputFile=%s %s 2>&1',
            escapeshellcmd($gs),
            self::DPI,
            max(1, $maxPages),
            escapeshellarg($out),
            escapeshellarg($absPdfPath)
        );

        $exitCode = 0;
        $output = [];
        exec($cmd, $output, $exitCode);

        if ($exitCode !== 0) {
            error_log('PdfRenderer: gs failed: ' . implode("\n", $output));
            self::cleanupDir($tmpDir);
            return [];
        }

        $files = glob($tmpDir . '/page-*.jpg') ?: [];
        sort($files);
        return $files;
    }

    public static function cleanupDir(string $dir): void
    {
        if (!is_dir($dir)) return;
        foreach (glob($dir . '/*') ?: [] as $f) @unlink($f);
        @rmdir($dir);
    }

    /**
     * Convenience: cleanup the parent directory of a list of files
     * (all returned paths share the same dir).
     */
    public static function cleanupFor(array $files): void
    {
        if (empty($files)) return;
        $dir = dirname($files[0]);
        self::cleanupDir($dir);
    }
}
