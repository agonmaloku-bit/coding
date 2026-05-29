<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddWorkflowTemplateIdToContractsAndBills extends Migration
{
    public function up()
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->unsignedBigInteger('workflow_template_id')->nullable()->after('step');
            $table->foreign('workflow_template_id')->references('id')->on('workflow_templates')->onDelete('set null');
        });

        Schema::table('bills', function (Blueprint $table) {
            $table->unsignedBigInteger('workflow_template_id')->nullable()->after('step');
            $table->foreign('workflow_template_id')->references('id')->on('workflow_templates')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropForeign(['workflow_template_id']);
            $table->dropColumn('workflow_template_id');
        });

        Schema::table('bills', function (Blueprint $table) {
            $table->dropForeign(['workflow_template_id']);
            $table->dropColumn('workflow_template_id');
        });
    }
}
