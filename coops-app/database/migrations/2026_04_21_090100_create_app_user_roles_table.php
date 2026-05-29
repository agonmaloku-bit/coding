<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAppUserRolesTable extends Migration
{
    public function up()
    {
        Schema::create('app_user_roles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('business_app_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('department_id')->nullable();
            $table->unsignedBigInteger('assigned_by')->nullable();
            $table->timestamps();

            $table->foreign('business_app_id')->references('id')->on('business_apps')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null');
            $table->foreign('assigned_by')->references('id')->on('users')->onDelete('set null');

            $table->unique(['business_app_id', 'user_id', 'role_id', 'department_id'], 'app_user_roles_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('app_user_roles');
    }
}
