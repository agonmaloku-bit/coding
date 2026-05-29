<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBillFilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bill_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bill_id')->nullable();
            $table->string('file_id')->nullable();
            $table->string('file_extension')->nullable();
            $table->string('file_path')->nullable();
            $table->integer('step')->nullable();
            $table->foreignId('user_id')->nullable();
            $table->string('file_name')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('bill_files');
    }
}