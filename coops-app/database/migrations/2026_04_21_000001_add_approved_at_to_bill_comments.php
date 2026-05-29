<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddApprovedAtToBillComments extends Migration
{
    public function up()
    {
        Schema::table('bill_comments', function (Blueprint $table) {
            $table->timestamp('approved_at')->nullable()->after('canceled');
        });
    }

    public function down()
    {
        Schema::table('bill_comments', function (Blueprint $table) {
            $table->dropColumn('approved_at');
        });
    }
}
