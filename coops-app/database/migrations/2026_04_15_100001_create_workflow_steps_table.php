<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkflowStepsTable extends Migration
{
    public function up()
    {
        Schema::create('workflow_steps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('workflow_template_id');
            $table->integer('step_order');
            $table->string('name');
            $table->unsignedBigInteger('role_id');
            $table->json('notify_roles')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('workflow_template_id')->references('id')->on('workflow_templates')->onDelete('cascade');
            $table->foreign('role_id')->references('id')->on('roles');
            $table->unique(['workflow_template_id', 'step_order']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('workflow_steps');
    }
}
