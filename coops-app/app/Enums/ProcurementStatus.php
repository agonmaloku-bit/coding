<?php

namespace App\Enums;

class ProcurementStatus
{
    const DRAFT        = 1;
    const SUBMITTED    = 2;
    const UNDER_REVIEW = 3;
    const APPROVED     = 4;
    const IN_PROCESSING = 5;
    const OFFER_EVALUATION = 6;
    const AWARDED      = 7;
    const COMPLETED    = 8;
    const REJECTED     = 9;
    const CANCELLED    = 10;

    public static function label(int $status): string
    {
        return [
            self::DRAFT            => 'Draft',
            self::SUBMITTED        => 'Submitted',
            self::UNDER_REVIEW     => 'Under Review',
            self::APPROVED         => 'Approved',
            self::IN_PROCESSING    => 'In Processing',
            self::OFFER_EVALUATION => 'Offer Evaluation',
            self::AWARDED          => 'Awarded',
            self::COMPLETED        => 'Completed',
            self::REJECTED         => 'Rejected',
            self::CANCELLED        => 'Cancelled',
        ][$status] ?? 'Unknown';
    }
}
