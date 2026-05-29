<?php

namespace Database\Seeders;

use App\Enums\Status;
use App\Enums\Step;
use App\Models\Company;
use App\Models\Contract;
use App\Models\ContractType;
use App\Models\Department;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ContractSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Contract::create([
            "name" => "Contract 1",
            "contract_type_id" => ContractType::find(1)->id,
            "name_of_contractor" => "Name of contractor",
            "address" => "Address",
//            "company_id" => Company::find(1)->id,
            "deadline_from" => Carbon::now(),
//            "deadline_to" => null,
            "responsible_person" => User::find(3)->id,
            "total_price" => 107.45 * 100,
            "unit_price" => 53.20 * 100,
            "payment_date" => Carbon::parse('2021-04-08'),
            "payment_terms" => "Bank",
            "created_by" => "1",
            "department_id" => Department::find(1)->id,
            "status" => Status::ARCHIVED,
        ]);


    }
}
