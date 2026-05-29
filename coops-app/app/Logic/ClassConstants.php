<?php

namespace App\Logic;

use ReflectionClass;

class ClassConstants
{
    public static function getClassConstants($className) {
        $class = new ReflectionClass($className);
        return $class->getConstants();
    }
}
