<?php


function replace_whites($string)
{
    return preg_replace('#\s{2,}#',' ', $string);
}
