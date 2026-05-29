<?php

namespace App\Providers;

use App\Mediators\CompanyMediator;
use App\Mediators\Contracts\CompanyMediatorInterface;
// added new
use App\Mediators\BillMediator;
use App\Mediators\Contracts\BillMediatorInterface;

use App\Mediators\SupplierMediator;
use App\Mediators\Contracts\SupplierMediatorInterface;
//
use App\Mediators\ContractMediator;
use App\Mediators\Contracts\ContractMediatorInterface;
use App\Mediators\Contracts\ContractTypeMediatorInterface;

use App\Mediators\Contracts\DepartmentMediatorInterface;
use App\Mediators\Contracts\DirectorDepartmentMediatorInterface;
use App\Mediators\Contracts\ExecutiveDirectorMediatorInterface;
use App\Mediators\Contracts\LegalOfficeMediatorInterface;
use App\Mediators\Contracts\PermissionMediatorInterface;
use App\Mediators\Contracts\ProcurementOfficerMediatorInterface;
use App\Mediators\Contracts\ResponsiblePersonMediatorInterface;
use App\Mediators\Contracts\RoleMediatorInterface;
use App\Mediators\Contracts\UserMediatorInterface;
use App\Mediators\Contracts\WorkflowTemplateMediatorInterface;
use App\Mediators\Contracts\ContractTemplateMediatorInterface;
use App\Mediators\WorkflowTemplateMediator;
use App\Mediators\ContractTemplateMediator;
use App\Mediators\ContractTypeMediator;
use App\Mediators\ProcurementMediator;
use App\Mediators\Contracts\ProcurementMediatorInterface;

use App\Mediators\DepartmentMediator;
use App\Mediators\DirectorDepartmentMediator;
use App\Mediators\ExecutiveDirectorMediator;
use App\Mediators\LegalOfficeMediator;
use App\Mediators\PermissionMediator;
use App\Mediators\ProcurementOfficerMediator;
use App\Mediators\ResponsiblePersonMediator;
use App\Mediators\RoleMediator;
use App\Mediators\UserMediator;
use Illuminate\Support\ServiceProvider;

class MediatorServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(CompanyMediatorInterface::class, CompanyMediator::class);
        $this->app->bind(DepartmentMediatorInterface::class, DepartmentMediator::class);
        $this->app->bind(ContractTypeMediatorInterface::class, ContractTypeMediator::class);
        $this->app->bind(ContractMediatorInterface::class, ContractMediator::class);
        // added new
        $this->app->bind(BillMediatorInterface::class, BillMediator::class);
        $this->app->bind(SupplierMediatorInterface::class, SupplierMediator::class);


        $this->app->bind(ResponsiblePersonMediatorInterface::class, ResponsiblePersonMediator::class);
        $this->app->bind(ProcurementOfficerMediatorInterface::class, ProcurementOfficerMediator::class);
        $this->app->bind(DirectorDepartmentMediatorInterface::class, DirectorDepartmentMediator::class);
        $this->app->bind(ExecutiveDirectorMediatorInterface::class, ExecutiveDirectorMediator::class);
        $this->app->bind(LegalOfficeMediatorInterface::class, LegalOfficeMediator::class);
        $this->app->bind(UserMediatorInterface::class, UserMediator::class);
        $this->app->bind(RoleMediatorInterface::class, RoleMediator::class);
        $this->app->bind(PermissionMediatorInterface::class, PermissionMediator::class);
        $this->app->bind(WorkflowTemplateMediatorInterface::class, WorkflowTemplateMediator::class);
        $this->app->bind(ContractTemplateMediatorInterface::class, ContractTemplateMediator::class);
        $this->app->bind(ProcurementMediatorInterface::class, ProcurementMediator::class);
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
