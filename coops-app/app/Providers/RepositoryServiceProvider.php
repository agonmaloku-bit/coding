<?php

namespace App\Providers;

use App\Repositories\BaseRepository;
use App\Repositories\CompanyRepository;
use App\Repositories\ContractRepository;
use App\Repositories\Contracts\CompanyRepositoryInterface;
use App\Repositories\Contracts\ContractRepositoryInterface;
use App\Repositories\Contracts\ContractTypeRepositoryInterface;
use App\Repositories\Contracts\EloquentRepositoryInterface;
use App\Repositories\Contracts\DepartmentRepositoryInterface;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
// added new
use App\Repositories\BillRepository;
use App\Repositories\BillFilesRepository;
use App\Repositories\Contracts\BillRepositoryInterface;
use App\Repositories\Contracts\BillFilesRepositoryInterface;
// new

use App\Repositories\SupplierRepository;
use App\Repositories\SupplierFilesRepository;
use App\Repositories\Contracts\SupplierRepositoryInterface;
use App\Repositories\Contracts\SupplierFilesRepositoryInterface;

use App\Repositories\WorkflowTemplateRepository;
use App\Repositories\Contracts\WorkflowTemplateRepositoryInterface;

use App\Repositories\ContractTemplateRepository;
use App\Repositories\Contracts\ContractTemplateRepositoryInterface;
use App\Repositories\ProcurementRequestRepository;
use App\Repositories\Contracts\ProcurementRequestRepositoryInterface;

use App\Repositories\ContractTypeRepository;
use App\Repositories\DepartmentRepository;
use App\Repositories\PermissionRepository;
use App\Repositories\RoleRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(EloquentRepositoryInterface::class, BaseRepository::class);
        $this->app->bind(CompanyRepositoryInterface::class, CompanyRepository::class);
        $this->app->bind(DepartmentRepositoryInterface::class, DepartmentRepository::class);
        $this->app->bind(ContractTypeRepositoryInterface::class, ContractTypeRepository::class);
        $this->app->bind(ContractRepositoryInterface::class, ContractRepository::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        // added new
        $this->app->bind(BillRepositoryInterface::class, BillRepository::class);
        $this->app->bind(RoleRepositoryInterface::class, RoleRepository::class);
        $this->app->bind(PermissionRepositoryInterface::class, PermissionRepository::class);
        $this->app->bind(BillFilesRepositoryInterface::class, BillFilesRepository::class);

        $this->app->bind(SupplierRepositoryInterface::class, SupplierRepository::class);
        $this->app->bind(WorkflowTemplateRepositoryInterface::class, WorkflowTemplateRepository::class);
        $this->app->bind(ContractTemplateRepositoryInterface::class, ContractTemplateRepository::class);
        $this->app->bind(ProcurementRequestRepositoryInterface::class, ProcurementRequestRepository::class);
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
