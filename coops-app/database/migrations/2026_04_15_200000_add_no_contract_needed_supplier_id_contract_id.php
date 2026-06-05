<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        $supplierAfterColumn = Schema::hasColumn('suppliers', 'numri_biznesit') ? 'numri_biznesit' : 'bussines_no';

        Schema::table('suppliers', function (Blueprint $table) use ($supplierAfterColumn) {
            $table->boolean('no_contract_needed')->default(false)->after($supplierAfterColumn);
        });

        Schema::table('contracts', function (Blueprint $table) {
            $table->unsignedBigInteger('supplier_id')->nullable()->after('name_of_contractor');
            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('set null');
        });

        Schema::table('bills', function (Blueprint $table) {
            $table->unsignedBigInteger('contract_id')->nullable()->after('supplier');
            $table->foreign('contract_id')->references('id')->on('contracts')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropForeign(['contract_id']);
            $table->dropColumn('contract_id');
        });

        Schema::table('contracts', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
            $table->dropColumn('supplier_id');
        });

        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn('no_contract_needed');
        });
    }
};
