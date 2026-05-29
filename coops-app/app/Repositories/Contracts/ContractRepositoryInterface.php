<?php

namespace App\Repositories\Contracts;

interface ContractRepositoryInterface
{
    public function getAll();

    public function findById($id);
    
    public function getAllContracts($userId);
    
    public function getAllActiveContracts($userId);
    
    public function getAllExpiredContracts($userId);
    
    public function getAllExpiringContracts($userId);
}
