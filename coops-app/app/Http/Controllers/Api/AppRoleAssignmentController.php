<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AppModule\AppRoleAssignmentStoreRequest;
use App\Models\AppUserRole;

class AppRoleAssignmentController extends Controller
{
    public function store(AppRoleAssignmentStoreRequest $request)
    {
        $payload = $request->validated();

        $created = [];
        foreach ($payload['role_ids'] as $roleId) {
            $created[] = AppUserRole::firstOrCreate(
                [
                    'business_app_id' => $payload['business_app_id'],
                    'user_id' => $payload['user_id'],
                    'role_id' => $roleId,
                    'department_id' => $payload['department_id'] ?? null,
                ],
                [
                    'assigned_by' => optional(auth()->user())->id,
                ]
            );
        }

        return AppUserRole::with('businessApp', 'user', 'role', 'department', 'assignedBy')
            ->whereIn('id', collect($created)->pluck('id'))
            ->get();
    }

    public function byApp($appId)
    {
        return AppUserRole::with('businessApp', 'user', 'role', 'department', 'assignedBy')
            ->where('business_app_id', $appId)
            ->orderByDesc('id')
            ->get();
    }

    public function byUser($userId)
    {
        return AppUserRole::with('businessApp', 'role', 'department', 'assignedBy')
            ->where('user_id', $userId)
            ->orderByDesc('id')
            ->get();
    }

    public function destroy($id)
    {
        $assignment = AppUserRole::findOrFail($id);
        $assignment->delete();

        return [
            'success' => true,
        ];
    }
}
