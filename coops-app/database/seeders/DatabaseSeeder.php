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
        $this->call(CompanyTableSeeder::class);
        $this->call(DepartmentTableSeeder::class);
        $this->call(RolesAndPermissionsSeeder::class);
        $this->call(BusinessAppSeeder::class);
        $this->call(UsersTableSeeder::class);
        $this->call(ContractTypeSeeder::class);
        $this->call(ContractSeeder::class);
    }
}
