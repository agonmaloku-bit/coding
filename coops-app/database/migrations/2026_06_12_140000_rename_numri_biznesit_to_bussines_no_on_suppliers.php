<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RenameNumriBiznesitToBussinesNoOnSuppliers extends Migration
{
    /**
     * The original create_suppliers migration ships the column as
     * `numri_biznesit`, but the rest of the application (model fillable,
     * form requests, seeders, controllers) uses `bussines_no`. Legacy dev
     * databases were renamed manually long ago; fresh installs hit
     * "Unknown column 'bussines_no'" on the first supplier save.
     *
     * Guarded so it is safe to run on both fresh and legacy installs.
     */
    public function up()
    {
        if (Schema::hasColumn('suppliers', 'numri_biznesit')
            && !Schema::hasColumn('suppliers', 'bussines_no')) {
            Schema::table('suppliers', function (Blueprint $table) {
                $table->renameColumn('numri_biznesit', 'bussines_no');
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('suppliers', 'bussines_no')
            && !Schema::hasColumn('suppliers', 'numri_biznesit')) {
            Schema::table('suppliers', function (Blueprint $table) {
                $table->renameColumn('bussines_no', 'numri_biznesit');
            });
        }
    }
}
