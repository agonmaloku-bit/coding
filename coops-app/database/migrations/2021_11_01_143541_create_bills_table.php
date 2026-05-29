<?php

use App\Enums\Status;
use App\Enums\Step;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBillsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("bills", function (Blueprint $table) {
            $table->id();

            // $table->string("name")->nullable();
            $table->string("type")->nullable();
            $table->string("value")->nullable();
            $table->string('bill_no')->nullable();
            // $table->bigInteger('bill_no')->startingValue(1000000000)->unique();
            $table->integer("supplier")->nullable();
            $table->text("description")->nullable();
            // $table->bigInteger("ordered")->unsigned();
            // $table->bigInteger("accepted")->unsigned();
            $table->text("comment")->nullable();
            // $table->string("file_upload")->nullable();
            $table->bigInteger("created_by")->unsigned();
            $table->bigInteger("updated_by")->unsigned()->nullable();
            $table->integer("step")->nullable();
            $table->integer("status")->nullable();
            $table->integer("assigned_dep_id")->nullable();
            $table->timestamp('approved_first')->nullable();
            $table->timestamp('approved_second')->nullable();
            // $table->timestamp('approved_third')->nullable();

            $table->softDeletes();
            $table->timestamps();

            // $table->foreign("ordered")->references("id")->on("users")->onDelete('cascade');
            $table->foreign("accepted")->references("id")->on("users")->onDelete('cascade');
            $table->foreign("created_by")->references("id")->on("users")->onDelete('cascade');
            $table->foreign("updated_by")->references("id")->on("users")->onDelete('cascade');
            $table->foreign("supplier")->references("id")->on("suppliers")->onDelete('cascade');
            $table->foreign("assigned_dep_id")->references("id")->on("departments")->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("bills");
    }
}
