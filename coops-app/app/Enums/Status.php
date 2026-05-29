<?php

namespace App\Enums;

class Status
{
    const ARCHIVED = 1;
    const REQUEST = 2;
    const IN_PROGRESS = 3;
    const CANCELED = 4;
    const APPROVED = 5;
    const PRINTED_CLOSED = 6;
    const DELIVERED_TO_FINANCES = 7;
}
