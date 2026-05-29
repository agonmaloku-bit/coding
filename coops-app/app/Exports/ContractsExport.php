<?php

namespace App\Exports;

use App\Models\Contract;
use App\Repositories\Contracts\ContractRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Maatwebsite\Excel\Concerns\FromCollection;

class ContractsExport implements FromCollection
{
    private $contracts;

    public function __construct($contracts)
    {
        $this->contracts = $contracts;

    }
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->contracts;
    }
}
