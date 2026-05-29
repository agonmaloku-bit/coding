<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanyTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Company::create([
            'name' => 'Kompania 1',
        ]);

        Company::create([
            'name' => 'Kompania 2',
        ]);

        Company::create([
            'name' => 'Kompania 3',
        ]);

        Company::create([
            'name' => 'Kompania 4',
        ]);

        Company::create([
            'name' => 'Kompania 5',
        ]);

        Company::create([
            'name' => 'BBROS L.L.C',
        ]);
    }
}
