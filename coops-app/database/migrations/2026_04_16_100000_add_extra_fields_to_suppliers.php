<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddExtraFieldsToSuppliers extends Migration
{
    public function up()
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $table->string('address')->nullable()->after('bussines_no');
            $table->string('phone')->nullable()->after('address');
            $table->string('email')->nullable()->after('phone');
            $table->string('website')->nullable()->after('email');
            $table->string('contact_name')->nullable()->after('website');
            $table->string('contact_surname')->nullable()->after('contact_name');
            $table->string('contact_email')->nullable()->after('contact_surname');
            $table->string('contact_phone')->nullable()->after('contact_email');
        });
    }

    public function down()
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn([
                'address', 'phone', 'email', 'website',
                'contact_name', 'contact_surname', 'contact_email', 'contact_phone',
            ]);
        });
    }
}
