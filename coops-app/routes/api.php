<?php

use App\Http\Controllers\Api\Auth\AuthenticationController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\ContractTypeController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DirectorDepartmentController;
use App\Http\Controllers\Api\ExecutiveDirectorController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\LegalOfficeController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ProcurementOfficerController;
use App\Http\Controllers\Api\ResponsiblePersonController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
//added new
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\BillFileController;
use App\Http\Controllers\Api\BillReportController;
use App\Http\Controllers\Api\ReportController;

use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\WorkflowTemplateController;
use App\Http\Controllers\Api\ContractTemplateController;
use App\Http\Controllers\Api\BusinessAppController;
use App\Http\Controllers\Api\AppRoleAssignmentController;
use App\Http\Controllers\Api\ProcurementController;
use App\Http\Controllers\Api\ArbkController;
use App\Http\Controllers\Api\AiSettingsController;
use App\Http\Controllers\Api\BillAiController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/login', [AuthenticationController::class, 'login']);
Route::post('/register', [AuthenticationController::class, 'register']);
Route::post('/logout', [AuthenticationController::class, 'logout'])->middleware(['auth:api']);
Route::post('/profile', [AuthenticationController::class, 'postProfile'])->middleware(['auth:api']);
Route::get('/user', [AuthenticationController::class, 'getUser'])->middleware(['auth:api']);

Route::get("/sendmail", [ContractController::class, 'sendmail']);

// Public download route (secured by random token)
Route::get("/admin/contract_templates/download-temp/{token}", [ContractTemplateController::class, 'downloadTemp']);

Route::get('/arbk/lookup', [ArbkController::class, 'lookup'])->middleware(['auth:api']);

Route::group(['prefix' => 'admin', 'middleware' => ['auth:api']], function () {
    Route::apiResource("/companies", CompanyController::class);
    Route::get("/departments/count", [DepartmentController::class, "countAllDepartments"]);
    Route::get("/departments/company/{id}", [DepartmentController::class, "getAllDepartmentsByCompanyId"]);
    Route::apiResource("/departments", DepartmentController::class);
    Route::apiResource("/contract_types", ContractTypeController::class);
    Route::get("/contract_templates/contract_type/{contractTypeId}", [ContractTemplateController::class, 'getByContractType']);
    Route::post("/contract_templates/extract-content", [ContractTemplateController::class, 'extractContent']);
    Route::post("/contract_templates/{id}/fill", [ContractTemplateController::class, 'fillTemplate']);
    Route::get("/contract_templates/{id}/download", [ContractTemplateController::class, 'download']);
    Route::apiResource("/contract_templates", ContractTemplateController::class);
    Route::post("/contracts/{id}/approve", [ContractController::class, 'approveContract']);
    Route::post("/contracts/{id}/cancel", [ContractController::class, 'cancelContract']);
    Route::post("/contracts/{id}/request-changes", [ContractController::class, 'requestChanges']);
    Route::post("/contracts/{id}/reassign", [ContractController::class, 'reassignResponsible']);
    Route::get("/contracts/{id}/timeline", [ContractController::class, 'timeline']);

    Route::get("/contracts/export", [ContractController::class, 'export']);
    Route::get("/contracts/archive", [ContractController::class, 'getArchiveContracts']);
    Route::get("/contracts/supplier/{supplierId}", [ContractController::class, 'getBySupplier']);
    Route::apiResource("/contracts", ContractController::class);
    Route::post("/contracts/request", [ContractController::class, 'request']);
    Route::get("/attachments/{id}", [FileController::class, 'index']);
    Route::get("/attachments/deleted", [FileController::class, 'index']);
    Route::apiResource("/users/responsible_person", ResponsiblePersonController::class);
    Route::get("/users/responsible_person/departments/{id}", [ResponsiblePersonController::class, 'getAllResponsiblePersonsByDepartmentId']);
    Route::apiResource("/users/procurement_officer", ProcurementOfficerController::class);
    Route::get("/users/procurement_officer/departments/{id}", [ProcurementOfficerController::class, 'getAllProcurementOfficersByDepartmentId']);
    Route::apiResource("/users/director_department", DirectorDepartmentController::class);
    Route::get("/director_department/departments/{id}", [DirectorDepartmentController::class, 'getAllDirectorDepartmentsByDepartmentId']);
    Route::apiResource("/users/executive_director", ExecutiveDirectorController::class);
    Route::apiResource("/users/legal_office", LegalOfficeController::class);
    Route::apiResource("/users", UserController::class);
    Route::get("/roles/departments/{ids}", [RoleController::class, "getAllRolesForDepartments"]);
    Route::get("/getDashboardData", [ContractController::class, "getDashboardData"]);
    Route::get("/roles/departments/{ids}/role/{roleName}", [RoleController::class, "getRoleByRoleNameInDepartments"]);
    Route::apiResource("/roles", RoleController::class);
    Route::get("/permissions/roles/{ids}", [PermissionController::class, "getAllPermissionsForRoles"]);
    Route::apiResource("/permissions", PermissionController::class);

    Route::get("/bills/dashboard", [BillController::class, 'dashboard']);
    Route::get("/bills/export", [BillController::class, 'export']);
    Route::get("/bills/{id}/timeline", [BillController::class, 'timeline']);
    Route::post("/bills/request", [BillController::class, 'request']);
    Route::post("/bills/report", [BillReportController::class, 'store']);
    Route::get("/bills/report", [BillReportController::class, 'index']);
    Route::get("/bills/report/{id}/download", [BillReportController::class, 'download']);
    Route::get("/reports/departments", [ReportController::class, 'departments']);
    Route::get("/reports/suppliers",   [ReportController::class, 'suppliers']);
    Route::get("/reports/users",       [ReportController::class, 'users']);
    Route::apiResource("/bills", BillController::class);
    Route::post("/bills/{id}/approve", [BillController::class, 'approveBill']);
    Route::post("/bills/{id}/cancel", [BillController::class, 'cancelBill']);
    Route::post("/bills/{id}/verify-ai", [BillAiController::class, 'verify']);
    Route::get("/bills/{id}/ai-checks/latest", [BillAiController::class, 'latest']);
    Route::post("/ai/extract-bill", [BillAiController::class, 'extractFromUpload']);
    Route::get("/billattachments/{id}", [BillFileController::class, 'index']);
    Route::delete("/bill_files/{billFileId}", [BillController::class, 'destroyBillFile']);
    Route::get("/get_exist_bills/{ids}/{supid}", [BillController::class, 'getExistsBills']);

    Route::apiResource("/suppliers", SupplierController::class);

    Route::apiResource("/workflow_templates", WorkflowTemplateController::class);
    Route::get("/workflow_templates/type/{type}", [WorkflowTemplateController::class, 'getByType']);

    Route::get('/business_apps/{appId}/assignments', [AppRoleAssignmentController::class, 'byApp']);
    Route::get('/business_apps/user/{userId}/assignments', [AppRoleAssignmentController::class, 'byUser']);
    Route::post('/business_apps/assignments', [AppRoleAssignmentController::class, 'store']);
    Route::delete('/business_apps/assignments/{id}', [AppRoleAssignmentController::class, 'destroy']);
    Route::apiResource('/business_apps', BusinessAppController::class)->only(['index', 'show']);

    Route::post('/procurement/{id}/advance', [ProcurementController::class, 'advance']);
    Route::post('/procurement/{id}/reject', [ProcurementController::class, 'reject']);
    Route::post('/procurement/{id}/cancel', [ProcurementController::class, 'cancel']);
    Route::apiResource('/procurement', ProcurementController::class);

    // AI provider settings (Super Admin only — enforced inside the controller).
    Route::get('/ai/settings',     [AiSettingsController::class, 'index']);
    Route::post('/ai/settings',    [AiSettingsController::class, 'update']);
    Route::post('/ai/settings/test', [AiSettingsController::class, 'test']);

});


Route::get("/getDashboardData", [ContractController::class, "getDashboardData"]);
