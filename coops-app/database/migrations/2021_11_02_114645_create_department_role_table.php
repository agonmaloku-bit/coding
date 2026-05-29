<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDepartmentRoleTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('roles', function (Blueprint $table) {
//            $table->bigInteger("department_id")->unsigned()->nullable();
            $table->string("description");
            $table->string("slug");

//            $table->foreign('department_id')->references('id')->on('departments')
//                ->onDelete('cascade');
        });
        Schema::create('department_role', function (Blueprint $table) {
            $table->bigInteger('department_id')->unsigned();
            $table->bigInteger('role_id')->unsigned();
            $table->foreign('department_id')->references('id')->on('departments')
                ->onDelete('cascade');
            $table->foreign('role_id')->references('id')->on('roles')
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
        Schema::table('roles', function($table) {
//            $table->dropColumn('department_id');
            $table->dropColumn('description');
            $table->dropColumn('slug');
        });
        Schema::dropIfExists('department_role');
    }
}
