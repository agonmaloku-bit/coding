<?php

use App\Enums\Status;
use App\Enums\Step;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContractsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("contracts", function (Blueprint $table) {
            $table->id();
            $table->bigInteger('serial_number')->startingValue(1000000000);
            $table->string("name");
            $table->bigInteger("contract_type_id")->unsigned();
            $table->string("name_of_contractor");
            $table->string("address");
            $table->string("purpose_contractor")->nullable();
//            $table->bigInteger("company_id")->unsigned();
            $table->date("deadline_from");
            $table->date("deadline_to")->nullable();
            $table->integer("notify_me")->nullable();
            $table->bigInteger("responsible_person")->unsigned();
            $table->bigInteger("total_price");
            $table->bigInteger("unit_price");
            $table->date("payment_date");
            $table->text("payment_terms");
            $table->text("contractor_obligations")->nullable();
            $table->text("company_obligations")->nullable();
            $table->bigInteger("created_by")->unsigned();
            $table->bigInteger("department_id")->unsigned();
            $table->integer("step")->nullable();
            $table->integer("status");
            $table->softDeletes();
            $table->timestamps();

            $table->foreign("contract_type_id")->references("id")->on("contract_types")->onDelete('cascade');
//            $table->foreign("company_id")->references("id")->on("companies")->onDelete('cascade');
            $table->foreign("responsible_person")->references("id")->on("users")->onDelete('cascade');
            $table->foreign("created_by")->references("id")->on("users")->onDelete('cascade');
            $table->foreign("department_id")->references("id")->on("departments")->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("contracts");
    }
}
