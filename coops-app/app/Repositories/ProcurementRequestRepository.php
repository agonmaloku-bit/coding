<?php

namespace App\Repositories;

use App\Enums\ProcurementStatus;
use App\Models\ProcurementRequest;
use App\Repositories\Contracts\ProcurementRequestRepositoryInterface;

class ProcurementRequestRepository extends BaseRepository implements ProcurementRequestRepositoryInterface
{
    public function __construct(ProcurementRequest $model)
    {
        parent::__construct($model);
    }

    public function getAll($request)
    {
        $query = $this->model
            ->withRelations()
            ->orderByDesc('id');

        if ($request->filled('search_text')) {
            $text = $request->input('search_text');
            $query->where(function ($q) use ($text) {
                $q->where('title', 'LIKE', "%{$text}%")
                  ->orWhere('id', 'LIKE', "%{$text}%")
                  ->orWhere('procurement_type', 'LIKE', "%{$text}%")
                  ->orWhere('description', 'LIKE', "%{$text}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'null') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->input('department_id'));
        }

        if ($request->filled('procurement_type')) {
            $query->where('procurement_type', $request->input('procurement_type'));
        }

        if ($request->filled('start_date')) {
            $query->where('created_at', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->where('created_at', '<=', $request->input('end_date'));
        }

        if ($request->has('page')) {
            return $query->paginate(15);
        }

        return $query->get();
    }

    public function findById($id)
    {
        return $this->model->withRelations()->findOrFail($id);
    }

    public function delete($id)
    {
        return $this->model->destroy($id);
    }
}
