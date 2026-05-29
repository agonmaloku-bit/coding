<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBillAiChecksTable extends Migration
{
    public function up()
    {
        Schema::create('bill_ai_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bill_id')->index();
            $table->string('model', 100)->nullable();
            $table->string('severity', 20)->nullable(); // ok / warn / block / error
            $table->longText('findings')->nullable();   // json (issues + extracted)
            $table->longText('raw_response')->nullable();
            $table->foreignId('user_id')->nullable();
            $table->integer('input_tokens')->nullable();
            $table->integer('output_tokens')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('bill_ai_checks');
    }
}
