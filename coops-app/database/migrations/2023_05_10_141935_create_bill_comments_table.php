<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBillCommentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bill_comments', function (Blueprint $table) {
            $table->id();
            $table->text('name');
            $table->bigInteger('bill_id')->unsigned();
            $table->bigInteger('user_id')->unsigned();
            $table->string('steps')->nullable();
            $table->boolean("canceled")->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('bill_id')->references('id')->on('bills')
                ->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('bill_comments');
    }
}