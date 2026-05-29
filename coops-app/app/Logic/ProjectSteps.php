<?php

namespace App\Logic;

class ProjectSteps
{
    public function __construct()
    {

    }

    public function checkIfContractIsValidForNextStep($contract)
    {
        if ($contract->status = 2 && $contractStatus->step < 6) {
            return true;
        }

        return false;
    }
    public function checkIfBillIsValidForNextStep($bill)
    {
        if ($bill->status = 2 && $billStatus->step < 6) {
            return true;
        }

        return false;
    }
}