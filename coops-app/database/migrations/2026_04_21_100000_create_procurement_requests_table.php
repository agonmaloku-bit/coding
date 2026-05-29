<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProcurementRequestsTable extends Migration
{
    public function up()
    {
        Schema::create('procurement_requests', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->text('description')->nullable();
            $table->text('justification')->nullable();
            $table->enum('procurement_type', ['goods', 'services', 'works'])->default('goods');
            $table->decimal('estimated_value', 15, 2)->nullable();

            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->unsignedBigInteger('assigned_officer')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();

            $table->integer('status')->default(1);
            $table->integer('step')->nullable();

            $table->date('needed_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();

            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();

            $table->unsignedBigInteger('outcome_contract_id')->nullable();
            $table->unsignedBigInteger('outcome_supplier_id')->nullable();

            $table->unsignedBigInteger('workflow_template_id')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->foreign('department_id')->references('id')->on('departments')->onDelete('cascade');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('assigned_officer')->references('id')->on('users')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('outcome_contract_id')->references('id')->on('contracts')->onDelete('set null');
            $table->foreign('outcome_supplier_id')->references('id')->on('suppliers')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('procurement_requests');
    }
}
