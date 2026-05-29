<?php

namespace App\Repositories;

use App\Models\BillFiles;
use Carbon\Carbon;
use App\Enums\Roles;
use App\Models\User;
use App\Repositories\Contracts\BillFilesRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Auth;


class BillFilesRepository extends BaseRepository implements BillFilesRepositoryInterface
{
    private $userRepository;
    public function __construct
    (
        BillFiles $model,
    ) {
        parent::__construct($model);
    }
    // public function getAllFiles($request)
    // {

    //     $query = $this->model->withTables()->orderByDesc('id');
    //     // $query = $this->model

    //     if (request()->has('page')) {
    //         return $query->paginate(10);
    //     } else {
    //         return $query->get();
    //     }

    // }


}