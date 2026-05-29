<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBillReportsTable extends Migration
{
    public function up()
    {
        Schema::create('bill_reports', function (Blueprint $table) {
            $table->id();
            $table->string('serial_number')->unique(); // e.g. 2026/0001
            $table->year('year');
            $table->unsignedInteger('sequence');
            $table->unsignedBigInteger('generated_by');
            $table->string('file_path')->nullable();
            $table->json('bill_ids');
            $table->timestamps();

            $table->unique(['year', 'sequence']);
            $table->foreign('generated_by')->references('id')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('bill_reports');
    }
}
