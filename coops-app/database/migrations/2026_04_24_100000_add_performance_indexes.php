<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Adds composite indexes targeting the hottest query patterns.
 *
 * See /home/pmk/docs/database/index-plan.md for rationale.
 *
 * Idempotent: indexes are skipped if they already exist, so the migration
 * can be safely re-run in environments that already have a subset applied.
 */
return new class extends Migration {
    /**
     * @var array<string, array<int, array{name: string, cols: array<int,string>}>>
     */
    private array $indexes = [
        'bills' => [
            ['name' => 'bills_status_deleted_created_idx',        'cols' => ['status', 'deleted_at', 'created_at']],
            ['name' => 'bills_assigned_dep_status_deleted_idx',   'cols' => ['assigned_dep_id', 'status', 'deleted_at']],
            ['name' => 'bills_created_by_deleted_idx',            'cols' => ['created_by', 'deleted_at']],
            ['name' => 'bills_step_status_idx',                   'cols' => ['step', 'status']],
        ],
        'bill_comments' => [
            ['name' => 'bill_comments_bill_steps_idx',            'cols' => ['bill_id', 'steps']],
        ],
        'contracts' => [
            ['name' => 'contracts_status_deleted_id_idx',         'cols' => ['status', 'deleted_at', 'id']],
            ['name' => 'contracts_dept_status_deleted_idx',       'cols' => ['department_id', 'status', 'deleted_at']],
            ['name' => 'contracts_created_by_deleted_idx',        'cols' => ['created_by', 'deleted_at']],
        ],
        'comments' => [
            ['name' => 'comments_contract_steps_idx',             'cols' => ['contract_id', 'steps']],
        ],
    ];

    public function up(): void
    {
        foreach ($this->indexes as $table => $indexes) {
            if (!Schema::hasTable($table)) {
                continue;
            }
            foreach ($indexes as $idx) {
                // Skip columns that don't exist (e.g. older schemas).
                $missing = false;
                foreach ($idx['cols'] as $col) {
                    if (!Schema::hasColumn($table, $col)) {
                        $missing = true;
                        break;
                    }
                }
                if ($missing) {
                    continue;
                }
                if ($this->indexExists($table, $idx['name'])) {
                    continue;
                }
                Schema::table($table, function (Blueprint $t) use ($idx) {
                    $t->index($idx['cols'], $idx['name']);
                });
            }
        }
    }

    public function down(): void
    {
        foreach ($this->indexes as $table => $indexes) {
            if (!Schema::hasTable($table)) {
                continue;
            }
            foreach ($indexes as $idx) {
                if (!$this->indexExists($table, $idx['name'])) {
                    continue;
                }
                Schema::table($table, function (Blueprint $t) use ($idx) {
                    $t->dropIndex($idx['name']);
                });
            }
        }
    }

    private function indexExists(string $table, string $index): bool
    {
        $db = DB::connection()->getDatabaseName();
        $row = DB::selectOne(
            'SELECT 1 FROM information_schema.STATISTICS
              WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1',
            [$db, $table, $index]
        );
        return $row !== null;
    }
};
