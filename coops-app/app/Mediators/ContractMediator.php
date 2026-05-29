<?php

namespace App\Mediators;

use App\Enums\Permissions;
use App\Enums\Roles;
use App\Enums\Status;
use App\Exports\ContractsExport;
use App\Facades\UserAuth;
use App\Http\Requests\Role\RoleStoreRequest;
use App\Http\Resources\ResponseResource;
use App\Logic\ContractStatus;
use App\Logic\Files;
use App\Logic\Permission;
use App\Logic\WorkflowEngine;
use App\Models\Comment;
use App\Models\File;
use App\Repositories\Contracts\ContractRepositoryInterface;
use App\Repositories\UserRepository;
use App\Mediators\Contracts\ContractMediatorInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\WorkflowTemplateRepositoryInterface;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Mail;
use Illuminate\Support\Facades\Auth;

class ContractMediator implements ContractMediatorInterface
{
    private $contractRepository;
    private $userRepository;
    private $workflowEngine;

    public function __construct(ContractRepositoryInterface $contractRepository,
                                UserRepositoryInterface  $userRepository,
                                WorkflowEngine $workflowEngine)
    {
        $this->contractRepository = $contractRepository;
        $this->userRepository = $userRepository;
        $this->workflowEngine = $workflowEngine;
    }

    public function getAll()
    {
        if (!Permission::hasPermissionTo(Permissions::CONTRACT_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }
        
        $user = $this->userRepository->findById(auth()->user()->id);
        
        if ($user->hasRole(Roles::RESPONSIBLE_PERSON))
        {
            return ResponseResource::make($this->contractRepository->getAllByResponsiblePersonId($user->id));
        }
        if ($user->hasRole(Roles::PROCUREMENT_OFFICER))
        {
            return ResponseResource::make($this->contractRepository->getAllByProcurementOfficerId($user->id));
        }
        if ($user->hasRole(Roles::DIRECTOR_DEPARTMENT))
        {
            $depId = $user->department_id;
            return ResponseResource::make($this->contractRepository->getAllByDirectorDepartmentId($depId));
        }
        if ($user->hasRole(Roles::EXECUTIVE_DIRECTOR))
        {
            return ResponseResource::make($this->contractRepository->getAllByExecutiveDirector());
        }
        if ($user->hasRole(Roles::LEGAL_OFFICE))
        {
            return ResponseResource::make($this->contractRepository->getAllByLegalOffice($user->id));
        }

        return ResponseResource::make($this->contractRepository->getAll());
    }

    public function getArchiveContracts()
    {
        if (!Permission::hasPermissionTo(Permissions::CONTRACT_ARCHIVE))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }
        
        $user = $this->userRepository->findById(auth()->user()->id);
        if ($user->hasRole(Roles::RESPONSIBLE_PERSON))
        {
            return ResponseResource::make($this->contractRepository->getAllByResponsiblePersonId($user->id));
        }
        // Komentet by Arber
        // if ($user->hasRole(Roles::LEGAL_OFFICE))
        // {
        //     return ResponseResource::make($this->contractRepository->getArchivedByLegalOffice());
        // }

        return ResponseResource::make($this->contractRepository->getArchive());
    }

    public function findbyId($id)
    {
        if (!Permission::hasPermissionTo(Permissions::CONTRACT_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->contractRepository->findById($id));
    }

    public function createContract($request)
    {
//        $status = ContractStatus::checkIfContractStatusIsArchivedOrRequset($request->status);
//        $request->request->add($status); // X

//        return $request->all();

        if (!Permission::hasPermissionTo([Permissions::CONTRACT_ADD, Permissions::CONTRACT_REQUEST]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $model = $this->contractRepository->store($request->except(['comment']));
        if ($model != null) {
            // Initialize workflow position to the first step of the resolved
            // template so the contract sits with the first approver (e.g. CEO)
            // regardless of whatever "step" value the UI may have sent.
            $template = $this->workflowEngine->resolveTemplate($model, 'contract');
            $firstStep = $template ? $template->steps()->orderBy('step_order')->first() : null;
            // Persist the resolved template so subsequent approvals use the
            // dynamic WorkflowEngine path instead of the legacy hardcoded
            // chain (which assumes Director Department → CEO → Legal).
            if ($template && empty($model->workflow_template_id)) {
                $model->workflow_template_id = $template->id;
            }
            $model->step   = $firstStep ? $firstStep->step_order : 1;
            $model->status = Status::REQUEST;
            $model->save();
        }
        if ($model != null && $request->has('comment'))
        {
            $model->comments()->create([
                'name' => $request->input('comment'),
                'user_id' => UserAuth::getUserId() ?: "1",
                // steps
            ]);
        }
        if ($model != null && $request->has('files'))
        {
            Files::saveAttachments($request, $model);
        }
        return ResponseResource::make($model);
    }

    public function requestContract($request)
    {
        $user = auth()->user();
        // return $request;
        if (!Permission::hasPermissionTo([Permissions::CONTRACT_REQUEST]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }
        
        $model = $this->contractRepository->store($request->except(['comment']));
        if ($model != null)
        {
            // Place the contract at the first step of its workflow template
            // (e.g. CEO Approval) so that approvers down the chain only see it
            // after the previous approver has acted. The UI may have submitted
            // an arbitrary `step` value which we deliberately override here.
            $template = $this->workflowEngine->resolveTemplate($model, 'contract');
            $firstStep = $template ? $template->steps()->orderBy('step_order')->first() : null;
            // Persist the template so the dynamic WorkflowEngine approval
            // path is used end-to-end (otherwise legacy hardcoded role/step
            // checks short-circuit the flow).
            if ($template && empty($model->workflow_template_id)) {
                $model->workflow_template_id = $template->id;
            }
            $model->step   = $firstStep ? $firstStep->step_order : 1;
            $model->status = Status::REQUEST;
            $model->save();

           $contract = $this->contractRepository->findById($model->id);
           \Mail::to($contract->responsiblePerson->email)->send(new \App\Mail\ContractAssigned($contract, $user->first_name . " " . $user->last_name));
               $ceos = $this->userRepository->getAllUsersByRoles(Roles::EXECUTIVE_DIRECTOR);
               foreach($ceos as $ceo) {
                   \Mail::to($ceo['email'])->send(new \App\Mail\ContractAssigned($contract, $user->first_name . " " . $user->last_name));
               }
           
           
        }
        
        if ($model != null && $request->has('comment'))
        {
            $model->comments()->create([
                'name' => $request->input('comment'),
                'user_id' => UserAuth::getUserId() ?: "1",
                'steps' => 1,
            ]);
        }
        if ($model != null && $request->has('files'))
        {
            Files::saveAttachments($request, $model);
        }

        // Attach filled template .docx if a download token was provided
        if ($model != null && $request->has('template_download_token'))
        {
            $token = $request->input('template_download_token');
            $tempDir = storage_path('app/public/temp');
            $matchedFiles = glob($tempDir . '/' . $token . '_*');
            if (!empty($matchedFiles) && file_exists($matchedFiles[0])) {
                $tempFile = $matchedFiles[0];
                $originalName = substr(basename($tempFile), strlen($token) + 1);

                // Build a filename that is unique per contract so that
                // multiple contracts generated from the same template do
                // not all download with the identical name.
                $templateStem = pathinfo($originalName, PATHINFO_FILENAME);
                // Drop the "_filled" suffix added by the template filler, if present.
                $templateStem = preg_replace('/_filled$/', '', $templateStem);
                $contractSlug = preg_replace('/[^A-Za-z0-9]+/', '_',
                    trim((string) ($model->name ?? '')));
                $contractSlug = trim($contractSlug, '_');
                // Cap length so the final filename stays well under OS limits.
                if (strlen($contractSlug) > 60) {
                    $contractSlug = substr($contractSlug, 0, 60);
                }
                $contractId   = $model->serial_number ?: $model->id;
                $displayName  = sprintf(
                    '%s_%s_%s.docx',
                    $templateStem ?: 'Contract',
                    $contractSlug ?: 'contract',
                    $contractId
                );

                $fileName = \Illuminate\Support\Str::uuid()->toString();
                $filePath = 'contracts/' . $model->id;
                $destDir = storage_path('app/' . $filePath);
                if (!is_dir($destDir)) {
                    mkdir($destDir, 0755, true);
                }
                copy($tempFile, $destDir . '/' . $fileName . '.docx');
                @unlink($tempFile);
                $model->files()->create([
                    'file_id' => $fileName,
                    'file_name' => $displayName,
                    'file_extension' => 'docx',
                    'file_path' => $filePath,
                    'step' => '0',
                    'user_id' => UserAuth::getUserId(),
                ]);
            }
        }

        return ResponseResource::make($model);
    }


    public function editContractById($request, $id)
    {
//        $status = ContractStatus::checkIfContractStatusIsArchivedOrRequset($request->status);
//        $request->request->add($status);

        if (!Permission::hasPermissionTo(Permissions::CONTRACT_EDIT))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        // Editable fields only — strip out items that we handle separately
        // (comments, files, file housekeeping) so the contract row update
        // doesn't try to write them as columns.
        $editable = $request->except([
            'comment',
            'files',
            'file',
            'files_deleted',
            'files_restore',
            'files_deleted_permanent',
            '_method',
            'id',
        ]);

        if (!empty($editable)) {
            $this->contractRepository->update($id, $editable);
        }

        $model = $this->contractRepository->findById($id);
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
            Files::saveAttachments($request, $model, $model->step ?: 0);
        }

        if ($request->has('files_deleted')) {
            $files = json_decode($request->input('files_deleted'));
            $ids = collect($files)->pluck('id');
            File::destroy($ids);
        }
        if ($request->has('files_restore')) {
            $files = json_decode($request->input('files_restore'));
            $ids = collect($files)->pluck('id');
            foreach ($ids as $fid) {
                File::onlyTrashed()->where('id', $fid)->restore();
            }
        }
        if ($request->has('files_deleted_permanent')) {
            $files = json_decode($request->input('files_deleted_permanent'));
            $ids = collect($files)->pluck('id');
            foreach ($ids as $fid) {
                File::withTrashed()->where('id', $fid)->forceDelete();
            }
            foreach ($files as $file) {
                $f = $file->file_path . '/'. $file->file_id . '.' . $file->file_extension;
                Storage::delete($f);
            }
        }
        return ResponseResource::make(['success' => true]);
    }

    public function deleteContractById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::CONTRACT_DELETE))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->contractRepository->destroy($id);
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }
    
    public function sendMail($contractId = null, $type = null, $name) {
        
        if(!is_null($contractId) && $type == 1) {
            $contract = $this->contractRepository->findById($contractId);
             $contractPerson = $contract->responsiblePerson->email;
              \Mail::to($contractPerson)->send(new \App\Mail\ContractApproved($contract, $name));
        }
        if(!is_null($contractId) && $type == 2) {
            $contract = $this->contractRepository->findById($contractId);
             $contractPerson = $contract->responsiblePerson->email;
              \Mail::to($contractPerson)->send(new \App\Mail\ContractCanceled($contract, $name));
        }

        
    }

    public function approveContract($id)
    {
        $contract = $this->contractRepository->find($id);

        if (is_null($contract)) {
            return ResponseResource::make(['success' => false]);
        }

        $user = auth()->user();
        $userName = $user->first_name . " " . $user->last_name;

        // Use dynamic workflow if a template is assigned
        $template = $this->workflowEngine->resolveTemplate($contract, 'contract');

        if ($template) {
            // Capture the step the user is acting on before the workflow
            // engine advances the contract — the comment / attachment must
            // be filed against THAT step (not the next one).
            $previousStep = $contract->step;

            $result = $this->workflowEngine->processApproval($contract, $template, $user);

            if (!$result['success']) {
                return ResponseResource::make(['success' => false, 'message' => $result['message'] ?? '']);
            }

            // Save comment
            if (request()->filled('comment')) {
                $contract->comments()->create([
                    'name' => request()->input('comment'),
                    'user_id' => UserAuth::getUserId() ?: "1",
                    'steps' => $previousStep,
                    'approved_at' => now(),
                ]);
            }

            // Save files if provided (UI sends single 'file' for approve,
            // multiple 'files[]' for request-changes / edit).
            if (request()->hasFile('files') || request()->hasFile('file')) {
                \App\Logic\Files::saveAttachments(request(), $contract, $previousStep);
            }

            // Send notifications
            $contractFull = $this->contractRepository->findById($contract->id);
            $mailClass = $result['final']
                ? new \App\Mail\ContractApproved($contractFull, $userName)
                : new \App\Mail\ContractAssigned($contractFull, $userName);

            // Notify roles configured for the next step
            foreach ($result['notifications'] as $email) {
                \Mail::to($email)->send(clone $mailClass);
            }

            // Always notify responsible person
            if ($contract->responsiblePerson) {
                \Mail::to($contract->responsiblePerson->email)->send(
                    new \App\Mail\ContractApproved($contractFull, $userName)
                );
            }

            return ResponseResource::make(['success' => true]);
        }

        // === LEGACY FALLBACK (no workflow template) ===
        $responsible_person = $this->userRepository->findById($contract->responsible_person);

        if ($user->hasRole(Roles::DIRECTOR_DEPARTMENT) && $contract->step == 1) {
            $contract->step = $contract->step + 1;
            $contract->status = Status::IN_PROGRESS;
            $result = $contract->save();

            $ceos = $this->userRepository->getAllUsersByRoles(Roles::EXECUTIVE_DIRECTOR);
            foreach($ceos as $ceo) {
                \Mail::to($ceo['email'])->send(new \App\Mail\ContractAssigned($contract, $userName));
            }
            if ($result == 0) {
                return ResponseResource::make(['success' => false]);
            }
            if (request()->has('comment')) {
                $contract->comments()->create([
                    'name' => request()->input('comment'),
                    'user_id' => UserAuth::getUserId() ?: "1",
                    'steps' => $contract->step,
                    'approved_at' => now(),
                ]);
            }
        }
        if ($user->hasRole(Roles::EXECUTIVE_DIRECTOR) && $contract->step == 2) {
            $contract->step = $contract->step + 1;
            $result = $contract->save();

            // Notify Legal department
            $legalOffices = $this->userRepository->getAllUsersByRoles(Roles::LEGAL_OFFICE);
            foreach($legalOffices as $legal) {
                \Mail::to($legal['email'])->send(new \App\Mail\ContractApproved($contract, $userName));
            }
            // Notify contract creator
            if ($contract->createdBy && $contract->createdBy->email) {
                \Mail::to($contract->createdBy->email)->send(new \App\Mail\ContractApproved($contract, $userName));
            }
            if ($result == 0) {
                return ResponseResource::make(['success' => false]);
            }
            if (request()->has('comment')) {
                $contract->comments()->create([
                    'name' => request()->input('comment'),
                    'user_id' => UserAuth::getUserId() ?: "1",
                    'steps' => $contract->step,
                    'approved_at' => now(),
                ]);
            }
        }
        if ($user->hasRole(Roles::LEGAL_OFFICE) && $contract->step == 3) {
            $contract->step = $contract->step + 1;
            $contract->status = Status::APPROVED;
            $result = $contract->save();
            $this->sendMail($contract->id, 1, $userName);
            // Notify contract creator
            if ($contract->createdBy && $contract->createdBy->email) {
                \Mail::to($contract->createdBy->email)->send(new \App\Mail\ContractApproved($contract, $userName));
            }
            if ($result == 0) {
                return ResponseResource::make(['success' => false]);
            }
            if (request()->has('comment')) {
                $contract->comments()->create([
                    'name' => request()->input('comment'),
                    'user_id' => UserAuth::getUserId() ?: "1",
                    'steps' => $contract->step,
                    'approved_at' => now(),
                ]);
            }
            return ResponseResource::make(['success' => true]);
        }
        if ($user->hasRole(Roles::DIRECTOR_DEPARTMENT) && $contract->step == 4) {
            $contract->step = $contract->step + 1;
            $result = $contract->save();

            $legalOffices = $this->userRepository->getAllUsersByRoles(Roles::LEGAL_OFFICE);
            foreach($legalOffices as $legal) {
                \Mail::to($legal['email'])->send(new \App\Mail\ContractApproved($contract, $userName));
            }
            if ($result == 0) {
                return ResponseResource::make(['success' => false]);
            }
            if (request()->has('comment')) {
                $contract->comments()->create([
                    'name' => request()->input('comment'),
                    'user_id' => UserAuth::getUserId() ?: "1",
                    'steps' => $contract->step,
                    'approved_at' => now(),
                ]);
            }
        }
        if ($user->hasRole(Roles::LEGAL_OFFICE) && $contract->step == 5) {
            $contract->step = $contract->step + 1;
            $contract->status = Status::APPROVED;
            $result = $contract->save();
            $this->sendMail($contract->id, 1, $userName);
            $ceos = $this->userRepository->getAllUsersByRoles(Roles::EXECUTIVE_DIRECTOR);
            foreach($ceos as $ceo) {
                \Mail::to($ceo['email'])->send(new \App\Mail\ContractApproved($contract, $userName));
            }
            if ($result == 0) {
                return ResponseResource::make(['success' => false]);
            }
            if (request()->has('comment')) {
                $contract->comments()->create([
                    'name' => request()->input('comment'),
                    'user_id' => UserAuth::getUserId() ?: "1",
                    'steps' => $contract->step,
                    'approved_at' => now(),
                ]);
            }
        }
        if ($user->hasRole(Roles::SUPER_ADMIN)) {
            $contract->step = $contract->step + 1;
            $result = $contract->save();
            if ($result == 0) {
                return ResponseResource::make(['success' => false]);
            }
            if (request()->has('comment')) {
                $contract->comments()->create([
                    'name' => request()->input('comment'),
                    'user_id' => UserAuth::getUserId() ?: "1",
                    'steps' => $contract->step,
                    'approved_at' => now(),
                ]);
            }
        }

        $this->sendMail($contract->id, 1, $userName);

        return ResponseResource::make(['success' => true]);
    }

    public function cancelContract($id)
    {
        $user = auth()->user();
        $contract = $this->contractRepository->find($id);
        if (is_null($contract)) {
            return ResponseResource::make(['success' => false]);
        }
        if ($contract->status == 4) {
            return ResponseResource::make(['success' => false]);
        }
        $contract->status = 4;
        $result = $contract->save();
        if ($result == 0) {
            return ResponseResource::make(['success' => false]);
        }
        if (request()->has('comment')) {
            $contract->comments()->create([
                'name' => request()->input('comment'),
                'user_id' => UserAuth::getUserId() ?: "1",
                'steps' => $contract->step,
                'canceled' => true
            ]);
        }
        $this->sendMail($contract->id, 2, $user->first_name . " " . $user->last_name);
        return ResponseResource::make(['success' => true]);
    }
    

    public function exportToExcel()
    {
        $contracts = $this->contractRepository->getAll();
        $contractsToPrint = [];
        foreach ($contracts as $contract)
        {
            $c['id'] = $contract->id;
            $c['serial_number'] = $contract->serial_number;
            $c['name'] = $contract->name;
            $c['contract_type'] = $contract->contract_type->name;
            $c['name_of_contractor'] = $contract->name_of_contractor;
            $c['address'] = $contract->address;
            $c['purpose_contractor'] = $contract->purpose_contractor;
            $c['deadline_from'] = $contract->deadline_from;
            $c['deadline_to'] = $contract->deadline_to;
            $c['responsible_person'] = $contract->responsiblePerson->first_name . ' ' . $contract->responsiblePerson->last_name;
            $c['total_price'] = $contract->total_price;
            $c['unit_price'] = $contract->unit_price;
            $c['payment_date'] = $contract->payment_date;
            $c['payment_terms'] = $contract->payment_terms;
            $c['contractor_obligations'] = $contract->contractor_obligations;
            $c['company_obligations'] = $contract->company_obligations;
            $c['created_by'] = $contract->createdBy->first_name . ' ' . $contract->createdBy->last_name;
            $c['status'] = $contract->status;
            $c['step'] = $contract->step;
            $c['created_at'] = date('d-m-Y', strtotime($contract->created_at));
            $c['updated_at'] = date('d-m-Y', strtotime($contract->updated_at));
            array_push($contractsToPrint, $c);
        }
//        dd($contractsToPrint);
//        return $contractsToPrint;
        return Excel::download(new ContractsExport(collect($contractsToPrint)), 'contracts.xlsx');
    }
    
    public function getDashboardData()
    {
        $userId = Auth::id();
        $allContracts = $this->contractRepository->getAllContracts($userId);
        $activeContracts = $this->contractRepository->getAllActiveContracts($userId);
        $expiredContracts = $this->contractRepository->getAllExpiredContracts($userId);
        $expiringContracts = $this->contractRepository->getAllExpiringContracts($userId);
        
        return [
            'allContracts' => $allContracts,
            'activeContracts' => $activeContracts,
            'expiredContracts' => $expiredContracts,
            'expiringContracts' => $expiringContracts
        ];
    }

    /**
     * Send a contract back one step in its workflow ("request changes").
     * The acting user must be on (or have already approved) the current step.
     * A non-empty comment is required and is logged to the contract.
     */
    public function requestChanges($id, $request)
    {
        if (!Permission::hasPermissionTo(Permissions::CONTRACT_APPROVE)) {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $contract = $this->contractRepository->find($id);
        if (is_null($contract)) {
            return ResponseResource::make(['success' => false, 'message' => 'Contract not found']);
        }

        $comment = trim((string) $request->input('comment', ''));
        if ($comment === '') {
            return ResponseResource::make(['success' => false, 'message' => 'A comment is required when requesting changes']);
        }

        $user = auth()->user();
        $template = $this->workflowEngine->resolveTemplate($contract, 'contract');

        // Verify current user has rights on the current step (same gate as approve).
        if ($template) {
            $currentStep = $template->getStepByOrder($contract->step);
            $allowed = $user->hasRole(Roles::SUPER_ADMIN)
                || ($currentStep && $currentStep->role && $user->hasRole($currentStep->role->name));
            if (!$allowed) {
                return ResponseResource::make(['success' => false, 'message' => 'You cannot request changes on this step']);
            }
        }

        $previousStep = max(1, (int) $contract->step - 1);
        $contract->step = $previousStep;
        $contract->status = Status::IN_PROGRESS;
        $contract->save();

        $contract->comments()->create([
            'name' => '↺ Request changes: ' . $comment,
            'user_id' => UserAuth::getUserId() ?: '1',
            'steps' => $contract->step,
        ]);

        if ($request->hasFile('files') || $request->has('files')) {
            Files::saveAttachments($request, $contract);
        }

        // Notify creator + responsible person + previous-step approver(s).
        $userName = $user->first_name . ' ' . $user->last_name;
        if ($contract->createdBy && $contract->createdBy->email) {
            \Mail::to($contract->createdBy->email)->send(new \App\Mail\ContractAssigned($contract, $userName));
        }
        if ($contract->responsiblePerson && $contract->responsiblePerson->email) {
            \Mail::to($contract->responsiblePerson->email)->send(new \App\Mail\ContractAssigned($contract, $userName));
        }

        return ResponseResource::make(['success' => true]);
    }

    /**
     * Reassign the responsible person of a contract. Admin / Super Admin only.
     * Logged as a comment for audit purposes.
     */
    public function reassignResponsible($id, $request)
    {
        $user = auth()->user();
        if (!$user->hasRole(Roles::SUPER_ADMIN) && !$user->hasRole(Roles::ADMIN)) {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $contract = $this->contractRepository->find($id);
        if (is_null($contract)) {
            return ResponseResource::make(['success' => false, 'message' => 'Contract not found']);
        }

        $newUserId = (int) $request->input('user_id');
        if ($newUserId <= 0) {
            return ResponseResource::make(['success' => false, 'message' => 'user_id is required']);
        }

        $newUser = $this->userRepository->findById($newUserId);
        if (is_null($newUser)) {
            return ResponseResource::make(['success' => false, 'message' => 'User not found']);
        }

        $oldUserId = $contract->responsible_person;
        $contract->responsible_person = $newUserId;
        $contract->save();

        $note = sprintf(
            '⤴ Reassigned responsible person from #%s to %s %s (#%d)',
            $oldUserId ?? '—',
            $newUser->first_name,
            $newUser->last_name,
            $newUserId
        );
        $reason = trim((string) $request->input('comment', ''));
        if ($reason !== '') {
            $note .= ' — ' . $reason;
        }

        $contract->comments()->create([
            'name' => $note,
            'user_id' => UserAuth::getUserId() ?: '1',
            'steps' => $contract->step,
        ]);

        if ($newUser->email) {
            $userName = $user->first_name . ' ' . $user->last_name;
            \Mail::to($newUser->email)->send(new \App\Mail\ContractAssigned($contract, $userName));
        }

        return ResponseResource::make(['success' => true]);
    }

    /**
     * Build a normalised timeline for a contract from existing data.
     * Events: created, comment, approval, request_changes, cancel, file, reassign.
     * No new tables required — derived from comments + files + contract metadata.
     */
    public function getTimeline($id)
    {
        if (!Permission::hasPermissionTo(Permissions::CONTRACT_SHOW)) {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $contract = $this->contractRepository->findById($id);
        if (is_null($contract)) {
            return ResponseResource::make(['events' => []]);
        }

        $events = [];

        // 1) Created
        if ($contract->createdBy) {
            $events[] = [
                'type' => 'created',
                'at' => optional($contract->created_at)->toIso8601String(),
                'step' => 1,
                'user' => [
                    'id' => $contract->createdBy->id,
                    'name' => trim($contract->createdBy->first_name . ' ' . $contract->createdBy->last_name),
                ],
                'message' => 'Contract created',
            ];
        }

        // 2) Comments → comment / approval / request_changes / cancel / reassign
        foreach ($contract->comments as $c) {
            $isCancel = (bool) ($c->canceled ?? false);
            $isApproval = !$isCancel && !is_null($c->approved_at);
            $name = (string) $c->name;
            $type = 'comment';
            if ($isCancel) {
                $type = 'cancel';
            } elseif ($isApproval) {
                $type = 'approval';
            } elseif (str_starts_with($name, '↺')) {
                $type = 'request_changes';
            } elseif (str_starts_with($name, '⤴')) {
                $type = 'reassign';
            }
            $events[] = [
                'type' => $type,
                'at' => optional($c->approved_at ?? $c->created_at)->toIso8601String(),
                'step' => $c->steps,
                'user' => $c->user ? [
                    'id' => $c->user->id,
                    'name' => trim($c->user->first_name . ' ' . $c->user->last_name),
                ] : null,
                'message' => $name,
            ];
        }

        // 3) Files
        foreach ($contract->files as $f) {
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

        // Sort chronologically (oldest first); skip nulls at the end.
        usort($events, function ($a, $b) {
            if ($a['at'] === $b['at']) return 0;
            if ($a['at'] === null) return 1;
            if ($b['at'] === null) return -1;
            return strcmp($a['at'], $b['at']);
        });

        return ResponseResource::make(['events' => $events]);
    }
}
