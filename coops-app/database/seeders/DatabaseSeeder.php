<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call(DefaultOrganizationSeeder::class);
        $this->call(RolesAndPermissionsSeeder::class);
        $this->call(BusinessAppSeeder::class);
    }
}
