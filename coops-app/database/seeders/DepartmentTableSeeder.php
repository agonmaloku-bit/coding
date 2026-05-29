<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $companies = Company::where("name", "!=", "BBROS L.L.C")->get();
        foreach ($companies as $company) {
            for ($i = 1; $i <= 4; $i++) {
                Department::create([
                    "name" => "Department {$i}",
                    "company_id" => $company->id
                ]);
            }
        }

        Department::create([
            "name" => "HR",
            "company_id" => Company::where("name", "BBROS L.L.C")->first()->id,
        ]);
    }
}
