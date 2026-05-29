<?php

namespace Database\Seeders;

use App\Models\ContractType;
use Illuminate\Database\Seeder;

class ContractTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        ContractType::create(['name' => 'Kontratë për Shërbime']);
        ContractType::create(['name' => 'Kontratë e Qiras']);
        ContractType::create(['name' => 'Kontratë për ndërtim të rrjetit']);
        ContractType::create(['name' => 'Kontratë për distributor']);
        ContractType::create(['name' => 'Kontratë për Mirëmbajtje/Instalime']);
        ContractType::create(['name' => 'Kontratë për Përmbajtje/Kontent']);
        ContractType::create(['name' => 'Kontratë për ISP']);
        ContractType::create(['name' => 'Kontratë për Donacion']);
        ContractType::create(['name' => 'Kontratë për Sponsorizime']);
    }
}
