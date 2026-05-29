<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AppModule\BusinessAppIndexRequest;
use App\Models\BusinessApp;

class BusinessAppController extends Controller
{
    public function index(BusinessAppIndexRequest $request)
    {
        $query = BusinessApp::query()->orderBy('sort_order')->orderBy('name');

        if ($request->boolean('only_active', true)) {
            $query->where('is_active', true);
        }

        return $query->get();
    }

    public function show($id)
    {
        return BusinessApp::with('userRoles.role', 'userRoles.user', 'userRoles.department')->findOrFail($id);
    }
}
