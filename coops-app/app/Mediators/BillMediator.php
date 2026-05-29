<?php

namespace App\Mediators;


use App\Enums\Permissions;
use App\Enums\Roles;
use App\Enums\Status;

use App\Exports\BillsExport;
use App\Facades\UserAuth;
use App\Http\Requests\Role\RoleStoreRequest;
use App\Http\Resources\ResponseResource;
use App\Http\Resources\BillResource;
use App\Logic\Files;
use App\Logic\Permission;
use App\Logic\BillStatus;
use App\Logic\WorkflowEngine;
use App\Models\BillComments;
use App\Models\User;
use App\Models\BillFiles;
use App\Repositories\Contracts\BillRepositoryInterface;
use App\Repositories\Contracts\BillFilesRepositoryInterface;
use App\Repositories\UserRepository;
use App\Mediators\Contracts\BillMediatorInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Mail;
use Illuminate\Support\Facades\Auth;


class BillMediator implements BillMediatorInterface
{
    private $billRepository;
    private $billFilesRepository;
    private $userRepository;
    private $workflowEngine;

    public function __construct(
        BillRepositoryInterface $billRepository,
        BillFilesRepositoryInterface $billFilesRepository,
        UserRepositoryInterface $userRepository,
        WorkflowEngine $workflowEngine
    ) {
        $this->billRepository = $billRepository;
        $this->billFilesRepository = $billFilesRepository;
        $this->userRepository = $userRepository;
        $this->workflowEngine = $workflowEngine;
    }
    public function getAll($request)
    {
        if (!Permission::hasPermissionTo(Permissions::BILL_SHOW)) {
            return response(
                [
                    'data' => new ResponseResource(['forbidden' => true]),
                    'message' => 'You do not have the required authorization.'
                ],
                403
            );
        }

        $user = $this->userRepository->findById(auth()->user()->id);


        if ($user->hasRole(Roles::RESPONSIBLE_PERSON)) {

            return BillResource::collection($this->billRepository->getAllByResponsiblePersonId($user->id));
        }
        if ($user->hasRole(Roles::PROCUREMENT_OFFICER)) {
            return BillResource::collection($this->billRepository->getAllByProcurementOfficerId($user->id, $request));
        }
        $departmentName = $user->department ? $user->department->name : null;

        if ($user->hasRole(Roles::DIRECTOR_DEPARTMENT)) {
            if ($departmentName == "Prokurimi" || $departmentName == "Financa") {
                return BillResource::collection($this->billRepository->getAll($request));
            } else {
                return BillResource::collection($this->billRepository->getAllByDirectorDepartmentId($user->id, $request));
            }
        }
        
        if ($user->hasRole(Roles::EXECUTIVE_DIRECTOR)) {
            return BillResource::collection($this->billRepository->getAllByExecutiveDirector($user->id, $request));
        }
        if ($user->hasRole(Roles::LEGAL_OFFICE)) {
            return BillResource::collection($this->billRepository->getAllByLegalOffice($user->id, $request));
        }

        return BillResource::collection($this->billRepository->getAll($request));
    }
    public function findbyId($id)
    {
        if (!Permission::hasPermissionTo(Permissions::BILL_SHOW)) {
            return response(
                [
                    'data' => new ResponseResource(['forbidden' => true]),
                    'message' => 'You do not have the required authorization.'
                ],
                403
            );
        }

        return new BillResource($this->billRepository->findById($id));
    }
 
    public function createBill($request)
    {
        if (!Permission::hasPermissionTo([Permissions::BILL_ADD, Permissions::BILL_REQUEST])) {
            return response(
                [
                    'data' => new ResponseResource(['forbidden' => true]),
                    'message' => 'You do not have the required authorization.'
                ],
                403
            );
        }
        $user = auth()->user();

        // Resolve default bill workflow template to assign on creation
        $defaultTemplate = $this->workflowEngine->resolveTemplate(new \App\Models\Bill(), 'bill');

        // if ($user->hasRole(Roles::DIRECTOR_DEPARTMENT) || $user->hasRole(Roles::PROCUREMENT_OFFICER)) {
            $departmentName = $user->department->name;

            // if (($departmentName == "Prokurimi") && $user->hasRole(Roles::DIRECTOR_DEPARTMENT)) {
            if (($departmentName == "Prokurimi") && $user->hasRole(Roles::DIRECTOR_DEPARTMENT)) {
            $model = $this->billRepository->store($request->all());
            if ($model != null && $request->has('comment')) {
                $model->comments()->create([
                    'name' => $request->input('comment'),
                    'user_id' => UserAuth::getUserId() ?: "1",
                    'steps' => 2,
                ]);
            }
            if ($model != null && $request->has('files')) {
                Files::saveBillAttachments($request, $model);
            }
            if ($model != null && $request->has('departments')) {
                $departmentId = $request->input('departments');
                $model->update(['assigned_dep_id' => $departmentId]);
            }
            $result = $this->billRepository->update($model->id, ['created_by' => UserAuth::getUserId() ?: "1", 'updated_by' => UserAuth::getUserId() ?: "1", 'status' => 1, 'step' => 1]);
            // Assign default bill workflow template if available
            if ($defaultTemplate) {
                $model->workflow_template_id = $defaultTemplate->id;
                $model->save();
            }

            $users = User::where('department_id', $departmentId)->get();
            foreach ($users as $assigneduser) {
                \Mail::to($assigneduser['email'])->send(new \App\Mail\BillAssigned($model, $user->first_name . " " . $user->last_name));
            }

            $ceos = $this->userRepository->getAllUsersByRoles(Roles::EXECUTIVE_DIRECTOR);
            foreach ($ceos as $ceo) {
                \Mail::to($ceo['email'])->send(new \App\Mail\BillAssigned($model, $user->first_name . " " . $user->last_name));
            }

        } else {
            $model = $this->billRepository->store($request->all());
            if ($model != null && $request->has('comment')) {
                $model->comments()->create([
                    'name' => $request->input('comment'),
                    'user_id' => UserAuth::getUserId() ?: "1",
                    'steps' => 5,
                ]);
            }
            if ($model != null && $request->has('files')) {
                Files::saveBillAttachments($request, $model);
            }
            if ($model != null && $request->has('departments')) {
                $model->update(['assigned_dep_id' => $request->input('departments')]);
            }
            $result = $this->billRepository->update($model->id, ['created_by' => UserAuth::getUserId() ?: "1", 'updated_by' => UserAuth::getUserId() ?: "1", 'step' => 1]);
            // Assign default bill workflow template if available
            if ($defaultTemplate) {
                $model->workflow_template_id = $defaultTemplate->id;
                $model->save();
            }
            // Te dergohet email tek Prokurimi
            $ceos = $this->userRepository->getAllUsersByRoles(Roles::PROCUREMENT_OFFICER);
            foreach ($ceos as $ceo) {
                \Mail::to($ceo['email'])->send(new \App\Mail\BillAssigned($model, $user->first_name . " " . $user->last_name));
            }
        }
        return ResponseResource::make($model);
    }
    public function editBillById($request, $id)
    {
        if (!Permission::hasPermissionTo(Permissions::BILL_EDIT)) {
            return response(
                [
                    'data' => new ResponseResource(['forbidden' => true]),
                    'message' => 'You do not have the required authorization.'
                ],
                403
            );
        }

        $editable = $request->except([
            'comment',
            'files',
            'file',
            '_method',
            'id',
        ]);

        if (!empty($editable)) {
            $this->billRepository->update($id, $editable);
        }

        $model = $this->billRepository->findById($id);
        if (is_null($model)) {
            return ResponseResource::make(['success' => false]);
        }

        if ($request->filled('comment')) {
            $model->comments()->create([
                'name' => $request->input('comment'),
                'user_id' => UserAuth::getUserId() ?: "1",
                'steps' => $model->step,
            ]);
        }

        if ($request->hasFile('files') || $request->hasFile('file')) {
            Files::saveBillAttachments($request, $model, $model->step ?: 0);
        }

        return ResponseResource::make(['success' => true]);
    }
    public function deleteBillById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::BILL_DELETE)) {
            return response(
                [
                    'data' => new ResponseResource(['forbidden' => true]),
                    'message' => 'You do not have the required authorization.'
                ],
                403
            );
        }

        $result = $this->billRepository->destroy($id);
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }
    public function approveBill($id)
    {
        $bill = $this->billRepository->find($id);

        if (is_null($bill)) {
            return ResponseResource::make(['success' => false]);
        }

        $user = auth()->user();
        $userName = $user->first_name . " " . $user->last_name;

        // Use dynamic workflow if a template is assigned
        $template = $this->workflowEngine->resolveTemplate($bill, 'bill');

        if ($template) {
            // Capture the step the user is acting on so the comment / file
            // gets tagged against THAT step (not the next one) after the
            // workflow engine advances the bill.
            $previousStep = $bill->step;

            $result = $this->workflowEngine->processApproval($bill, $template, $user);

            if (!$result['success']) {
                return ResponseResource::make(['success' => false, 'message' => $result['message'] ?? '']);
            }

            // Override status to bill-specific values per completed step
            // Step 1 done → PENDING (2), Step 2 done → APPROVED FROM CEO (3)
            $billStatusMap = [1 => 2, 2 => 3];
            if (isset($billStatusMap[$result['currentStep']->step_order])) {
                $bill->status = $billStatusMap[$result['currentStep']->step_order];
            }

            // Record approval timestamps per step
            $stepOrder = $result['currentStep'] ? $result['currentStep']->step_order : null;
            if ($stepOrder == 1) {
                $bill->approved_first = now();
            } elseif ($stepOrder == 2) {
                $bill->approved_second = now();
            }

            $bill->updated_by = UserAuth::getUserId() ?: "1";
            $bill->save();

            // Save comment — record the step that was just approved
            $bill->comments()->create([
                'name' => request()->input('comment', 'No comment'),
                'user_id' => UserAuth::getUserId() ?: "1",
                'steps' => $result['currentStep'] ? $result['currentStep']->step_order : $previousStep,
                'approved_at' => now(),
            ]);

            // Save files attached at this step (UI sends single 'file' for
            // approve, multiple 'files[]' for edit/comment).
            if (request()->hasFile('files') || request()->hasFile('file')) {
                Files::saveBillAttachments(request(), $bill, $result['currentStep'] ? $result['currentStep']->step_order : $previousStep);
            }

            // CEO bypass auto-advance: when Executive Director approves step 1 acting as
            // Director Department for their own department, immediately also process step 2
            // (their actual CEO approval), so one click fully approves the bill.
            $wasCeoBypass = !$result['final']
                && $user->hasRole(Roles::EXECUTIVE_DIRECTOR)
                && !empty($user->department_id)
                && $bill->assigned_dep_id == $user->department_id;

            if ($wasCeoBypass) {
                $result2 = $this->workflowEngine->processApproval($bill, $template, $user);
                if ($result2['success']) {
                    if (isset($billStatusMap[$result2['currentStep']->step_order])) {
                        $bill->status = $billStatusMap[$result2['currentStep']->step_order];
                    }
                    if ($result2['currentStep']->step_order == 2) {
                        $bill->approved_second = now();
                    }
                    $bill->updated_by = UserAuth::getUserId() ?: "1";
                    $bill->save();

                    $bill->comments()->create([
                        'name' => request()->input('comment', 'No comment'),
                        'user_id' => UserAuth::getUserId() ?: "1",
                        'steps' => $result2['currentStep']->step_order,
                        'approved_at' => now(),
                    ]);

                    // Use step 2 result for notifications
                    $result = $result2;
                }
            }

            // (Files were already saved earlier with the correct step.)

            // Send notifications
            $billFull = $this->billRepository->findById($bill->id);
            foreach ($result['notifications'] as $email) {
                \Mail::to($email)->send(new \App\Mail\BillApproved($billFull, $userName));
            }

            // Notify bill creator
            if ($result['final'] || !empty($result['notifications'])) {
                $billCreator = $this->userRepository->findById($bill->created_by);
                if ($billCreator) {
                    \Mail::to($billCreator->email)->send(new \App\Mail\BillApproved($billFull, $userName));
                }
            }

            return ResponseResource::make(['success' => true]);
        }

        // === LEGACY FALLBACK (no workflow template) ===
        // Step 1: Director Department / Legal Office approves → status=2 (PENDING)
        if (($user->hasRole(Roles::DIRECTOR_DEPARTMENT) || $user->hasRole(Roles::LEGAL_OFFICE)) && $bill->step == 1) {
            $bill->step = 2;
            $bill->status = 2; // PENDING – waiting for CEO
            $bill->updated_by = UserAuth::getUserId() ?: "1";
            $bill->approved_first = now();
            $result = $bill->save();

            if ($result == 0) {
                return ResponseResource::make(['success' => false]);
            }

            $bill->comments()->create([
                'name' => request()->input('comment', 'No comment'),
                'user_id' => UserAuth::getUserId() ?: "1",
                'steps' => 1,
                'approved_at' => now()
            ]);

            $ceos = $this->userRepository->getAllUsersByRoles(Roles::EXECUTIVE_DIRECTOR);
            foreach ($ceos as $ceo) {
                \Mail::to($ceo['email'])->send(new \App\Mail\BillApproved($bill, $userName));
            }

            return ResponseResource::make(['success' => true]);
        }

        // Step 2: Executive Director (CEO) approves → status=3 (APPROVED FROM CEO)
        if ($user->hasRole(Roles::EXECUTIVE_DIRECTOR) && $bill->step == 2 && $bill->status == 2) {
            $bill->step = 3;
            $bill->status = 3; // APPROVED FROM CEO
            $bill->updated_by = UserAuth::getUserId() ?: "1";
            $bill->approved_second = now();
            $result = $bill->save();

            if ($result == 0) {
                return ResponseResource::make(['success' => false]);
            }

            $bill->comments()->create([
                'name' => request()->input('comment', 'No comment'),
                'user_id' => UserAuth::getUserId() ?: "1",
                'steps' => 2,
                'approved_at' => now()
            ]);

            $BillCreatedBy = $this->userRepository->findById($bill->created_by);
            \Mail::to($BillCreatedBy->email)->send(new \App\Mail\BillApproved($bill, $userName));

            return ResponseResource::make(['success' => true]);
        }

        // Step 3: Super Admin gives final approval → status=5 (APPROVED FROM ADMIN)
        if ($user->hasRole(Roles::SUPER_ADMIN) && $bill->step == 3) {
            $bill->step = 4;
            $bill->status = 5; // APPROVED FROM ADMIN
            $bill->updated_by = UserAuth::getUserId() ?: "1";
            $result = $bill->save();

            if ($result == 0) {
                return ResponseResource::make(['success' => false]);
            }

            $bill->comments()->create([
                'name' => request()->input('comment', 'No comment'),
                'user_id' => UserAuth::getUserId() ?: "1",
                'steps' => 3,
                'approved_at' => now()
            ]);

            $BillCreatedBy = $this->userRepository->findById($bill->created_by);
            \Mail::to($BillCreatedBy->email)->send(new \App\Mail\BillApproved($bill, $userName));

            return ResponseResource::make(['success' => true]);
        }

        return ResponseResource::make(['success' => false, 'message' => 'Not authorized for the current approval step']);
    }
    public function cancelBill($id)
    {
        $user = auth()->user();
        $bill = $this->billRepository->find($id);

        if (is_null($bill)) {
            return ResponseResource::make(['success' => false]);
        }
        $bill->step = $bill->step + 1;
        $bill->status = 4;
        $result = $bill->save();

        if ($result == 0) {
            return ResponseResource::make(['success' => false]);
        }

        if (request()->has('comment')) {
            $bill->comments()->create([
                'name' => request()->input('comment'),
                'user_id' => UserAuth::getUserId() ?: "1",
                'steps' => $bill->step,
            ]);
        }
        $BillCreatedById = $bill->created_by;
        $BillCreatedBy = $this->userRepository->findById($BillCreatedById);

        \Mail::to($BillCreatedBy->email)->send(new \App\Mail\BillCanceled($bill, $user->first_name . " " . $user->last_name));

        return ResponseResource::make(['success' => true]);
    }

    /**
     * Build a chronological activity timeline for a bill: creation,
     * comments / approvals / cancellations, and file uploads. Mirrors the
     * shape used by the contract drawer so the same UI component pattern
     * works for bills.
     */
    public function getTimeline($id)
    {
        if (!Permission::hasPermissionTo(Permissions::BILL_SHOW)) {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $bill = $this->billRepository->findById($id);
        if (is_null($bill)) {
            return ResponseResource::make(['events' => []]);
        }

        $events = [];

        if ($bill->createdBy) {
            $events[] = [
                'type' => 'created',
                'at' => optional($bill->created_at)->toIso8601String(),
                'step' => 1,
                'user' => [
                    'id' => $bill->createdBy->id,
                    'name' => trim($bill->createdBy->first_name . ' ' . $bill->createdBy->last_name),
                ],
                'message' => 'Bill created',
            ];
        }

        foreach ($bill->comments as $c) {
            $isCancel = (bool) ($c->canceled ?? false);
            $isApproval = !$isCancel && !is_null($c->approved_at);
            $type = $isCancel ? 'cancel' : ($isApproval ? 'approval' : 'comment');
            $events[] = [
                'type' => $type,
                'at' => optional($c->approved_at ?? $c->created_at)->toIso8601String(),
                'step' => $c->steps,
                'user' => $c->user ? [
                    'id' => $c->user->id,
                    'name' => trim($c->user->first_name . ' ' . $c->user->last_name),
                ] : null,
                'message' => (string) $c->name,
            ];
        }

        foreach ($bill->files as $f) {
            $events[] = [
                'type' => 'file',
                'at' => optional($f->created_at)->toIso8601String(),
                'step' => $f->step,
                'user' => $f->user ? [
                    'id' => $f->user->id,
                    'name' => trim($f->user->first_name . ' ' . $f->user->last_name),
                ] : null,
                'message' => $f->file_name ?: ($f->file_id . '.' . $f->file_extension),
                'file' => [
                    'id' => $f->id,
                    'file_id' => $f->file_id,
                    'file_extension' => $f->file_extension,
                    'file_name' => $f->file_name,
                ],
            ];
        }

        usort($events, function ($a, $b) {
            if ($a['at'] === $b['at']) return 0;
            if ($a['at'] === null) return 1;
            if ($b['at'] === null) return -1;
            return strcmp($a['at'], $b['at']);
        });

        return ResponseResource::make(['events' => $events]);
    }

    public function exportToExcel()
    {
        $bills = $this->billRepository->getAll();
        $billsToPrint = [];
        foreach ($bills as $bill) {
            $c['id'] = $bill->id;
            $c['bill_no'] = $bill->bill_no;
            $c['name'] = $bill->name;
            $c['type'] = $bill->type;
            $c['supplier'] = $bill->supplier;
            $c['value'] = $bill->value;
            $c['created_by'] = $bill->createdBy->first_name . ' ' . $bill->createdBy->last_name;
            $c['updated_by'] = $bill->updatedBy->first_name . ' ' . $bill->updatedBy->last_name;
            $c['status'] = $bill->status;
            $c['step'] = $bill->step;
            $c['created_at'] = date('d-m-Y', strtotime($bill->created_at));
            $c['updated_at'] = date('d-m-Y', strtotime($bill->updated_at));

            array_push($billsToPrint, $c);
        }
        //        dd($billsToPrint);
//        return $billsToPrint;
        return Excel::download(new BillsExport(collect($billsToPrint)), 'bills.xlsx');
    }
    public function RemoveFile($id)
    {
        $result = $this->billFilesRepository->destroy($id);
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }
    
    public function getExistsBill($id, $supid) {
        return $this->billRepository->findByIdAndSupplier($id, $supid);
    }

    public function dashboard()
    {
        $user = $this->userRepository->findById(auth()->user()->id);

        $query = \App\Models\Bill::query()->whereNull('deleted_at');

        // Apply the same visibility scope as the bill list
        if ($user->hasRole(Roles::SUPER_ADMIN) || $user->hasRole(Roles::ADMIN)) {
            // See all bills
        } elseif ($user->hasRole(Roles::DIRECTOR_DEPARTMENT)) {
            $departmentName = $user->department ? $user->department->name : null;
            if ($departmentName === 'Prokurimi' || $departmentName === 'Financa') {
                // Prokurimi / Finance directors see all
            } else {
                $query->where(function ($q) use ($user) {
                    $q->where('created_by', $user->id)
                      ->orWhere('assigned_dep_id', $user->department_id);
                });
            }
        } elseif ($user->hasRole(Roles::PROCUREMENT_OFFICER)) {
            $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                  ->orWhere('assigned_dep_id', $user->department_id);
            });
        } elseif ($user->hasRole(Roles::EXECUTIVE_DIRECTOR)) {
            $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                  ->orWhere('status', 2)
                  ->orWhere('status', 3)
                  ->orWhere('assigned_dep_id', $user->department_id);
            });
        } elseif ($user->hasRole(Roles::LEGAL_OFFICE)) {
            $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                  ->orWhere('assigned_dep_id', $user->department_id);
            });
        } elseif ($user->hasRole(Roles::RESPONSIBLE_PERSON)) {
            $query->where('created_by', $user->id);
        }
        // Fallback: unscoped (matches getAll behaviour)

        $counts = (clone $query)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return response()->json([
            'requested'        => $counts->get(1, 0),
            'pending'          => $counts->get(2, 0),
            'approved_ceo'     => $counts->get(3, 0),
            'canceled'         => $counts->get(4, 0),
            'approved_admin'   => $counts->get(5, 0),
            'printed'          => $counts->get(6, 0),
            'delivered'        => $counts->get(7, 0),
            'total'            => $counts->sum(),
        ]);
    }
}