<?php

namespace App\Logic;

use App\Enums\Status;
use App\Enums\Step;

class BillStatus
{
    public static function checkIfBillStatusIsArchivedOrRequset($type)
    {
        if ($type == Status::ARCHIVED) {
            return [
                'status' => Status::ARCHIVED,
            ];
        }

        if ($type == Status::REQUEST) {
            return [
                'status' => Status::ARCHIVED,
            ];
        }
    }
}