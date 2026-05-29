<?php

namespace App\Exports;

use App\Models\Bill;
use App\Repositories\Contracts\BillsRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Maatwebsite\Excel\Concerns\FromCollection;

class BillsExport implements FromCollection
{
    private $bills;

    public function __construct($bills)
    {
        $this->bills = $bills;

    }
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return $this->bills;
    }
}