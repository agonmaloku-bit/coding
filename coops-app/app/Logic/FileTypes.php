<?php

namespace App\Logic;

class FileTypes
{
    public static function getAllowedFileTypes()
    {
        return [
            'csv',
            'xls',
            'xlsx',
            'doc',
            'docx',
            'pdf',
            'jpg',
            'png',
            'jpeg',
        ];
    }
}
