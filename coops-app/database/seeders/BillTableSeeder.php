<?php

namespace Database\Seeders;

use App\Enums\Status;
use App\Models\Bill;
use Illuminate\Database\Seeder;

class BillTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Bill::create([
            // "name" => "Name",
            "type" => "Type of bill",
            "value" => "22222",
            "bill_no" => "10001",
            "supplier" => "1",
            "description" => "Description of this bill",
            // "ordered" => "1",
            // "accepted" => "1",
            "comment" => "coment of the bill",
            "created_by" => "1",
            "status" => Status::ARCHIVED,
        ]);

    }
}
