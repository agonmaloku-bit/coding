<?php

namespace App\Repositories;

use App\Models\Contract;
use Carbon\Carbon;
use App\Enums\Roles;
use App\Repositories\Contracts\ContractRepositoryInterface;
use Illuminate\Support\Facades\Auth;

class ContractRepository extends BaseRepository implements ContractRepositoryInterface
{
    public function __construct(Contract $model)
    {
        parent::__construct($model);
    }

    public function getAll()
    {
        $query = $this->model->withTables();

        if (request()->has('search_text')) {
            if (request()->input('search_text') != "null") {
                $query->where(function ($q) {
                    $q->where('id', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('serial_number', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('name', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('name_of_contractor', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('address', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('purpose_contractor', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('deadline_from', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('deadline_to', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('total_price', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('unit_price', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('payment_date', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('payment_terms', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('contractor_obligations', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('company_obligations', 'LIKE', '%' . request()->input('search_text') . '%');
                });
            }
        }
        if (request()->has('search_status')) {
               if (request()->input('search_status') == 99) {
                   $query->where('deadline_to', '<=', date("Y-m-d"));
               }
           }

        if(request()->has('contract_type')) {
            $query->where('contract_type_id', request()->input('contract_type'));
        }
        if (request()->has('search_order') && request()->has('search_sort')) {
            if (request()->input('search_sort') == 'ASC') {
                $query->orderBy(request()->input('search_order'), 'ASC');
            }
            if (request()->input('search_sort') == 'DESC') {
                $query->orderBy(request()->input('search_order'), 'DESC');
            }
        }
        if (request()->has('start_date')) {
            if (request()->input('start_date') != null)
                $query->where('deadline_from', request()->input('start_date'));
        }
        if (request()->has('end_date')) {
            if (request()->input('end_date') != null)
                $query->where('deadline_to', request()->input('end_date'));
        }
        if (request()->has('company')) {
            if (request()->has('procurement_officer')) {
                if (request()->input('procurement_officer') != null) {
                    $query->where('created_by', request()->input('procurement_officer'));
                }
            }
            if (request()->has('responsible_person')) {
                if (request()->input('responsible_person') != null) {
                    $query->where('responsible_person', request()->input('responsible_person'));
                }
            }
            if (request()->has('department')) {
                if (request()->input('department') != null) {
                    $query->whereHas("responsiblePerson.department", function ($q) {
                        $q->where('department_id', request()->input('department'));
                    });
                }
            } else {
                if (request()->input('company') != null) {
                    $query->whereHas("responsiblePerson.department", function ($q) {
                        $q->with("department")
                            ->where('company_id', request()->input('company'));
                    });
                }
            }
        }

        $query->where('status', '!=', 1);

        if (request()->has('page')) {
            return $query->paginate(10);
        } else {
            $query->get();
        }


    }

    public function getArchive()
    {
        $query = $this->model->withTables();

        if (request()->has('search_text')) {
            if (request()->input('search_text') != "null") {
                $query->where(function ($q) {
                    $q->where('id', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('serial_number', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('name', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('name_of_contractor', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('address', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('purpose_contractor', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('deadline_from', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('deadline_to', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('total_price', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('unit_price', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('payment_date', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('payment_terms', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('contractor_obligations', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('company_obligations', 'LIKE', '%' . request()->input('search_text') . '%');
                });
            }
        }

       if (request()->has('search_status')) {
           if (request()->input('search_status') == 99) {
               $query->where('deadline_to', '<=', date("Y-m-d"));
           }
       }

        if(request()->has('contract_type')) {
            $query->where('contract_type_id', request()->input('contract_type'));
        }
        if (request()->has('search_order') && request()->has('search_sort')) {
            if (request()->input('search_sort') == 'ASC') {
                $query->orderBy(request()->input('search_order'), 'ASC');
            }
            if (request()->input('search_sort') == 'DESC') {
                $query->orderBy(request()->input('search_order'), 'DESC');
            }
        }
        if (request()->has('start_date')) {
            if (request()->input('start_date') != null)
                $query->where('deadline_from', request()->input('start_date'));
        }
        if (request()->has('end_date')) {
            if (request()->input('end_date') != null)
                $query->where('deadline_to', request()->input('end_date'));
        }
        if (request()->has('company')) {
            if (request()->has('procurement_officer')) {
                if (request()->input('procurement_officer') != null) {
                    $query->where('created_by', request()->input('procurement_officer'));
                }
            }
            if (request()->has('responsible_person')) {
                if (request()->input('responsible_person') != null) {
                    $query->where('responsible_person', request()->input('responsible_person'));
                }
            }
//            if (!request()->has('procurement_officer') || !request()->has('responsible_person')) {
//                if (request()->has('department')) {
//                    if (request()->input('department') != null) {
//                        $query->whereHas("responsible_person.department", function ($q) {
//                            $q->where('department_id', request()->input('department'));
//                        });
//                    }
//                } else {
//                    if (request()->input('company') != null) {
//                        $query->whereHas("responsible_person.department", function ($q) {
//                            $q->with("department")
//                                ->where('company_id', request()->input('company'));
//                        });
//                    }
//                }
//            }
            if (request()->has('department')) {
                if (request()->input('department') != null) {
                    $query->whereHas("responsiblePerson.department", function ($q) {
                        $q->where('department_id', request()->input('department'));
                    });
                }
            } 
            else {
                if (request()->input('company') != null) {
                    $query->whereHas("responsiblePerson.department", function ($q) {
                        $q->with("department")
                            ->where('company_id', request()->input('company'));
                    });
                }
            }
        }
        $query->where('status', 1);

        if (request()->has('page')) {
            return $query->paginate(10);
        } else {
            $query->get();
        }

//        return $this->model
//            ->withTables()
//            ->orderByDesc('id')
//            ->get();
    }

    public function getAllByResponsiblePersonId($id)
    {
        
        $query = $this->model->withTables();

        if (request()->has('search_text')) {
            if (request()->input('search_text') != "null") {
                $query->where(function ($q) {
                    $q->where('responsible_person', $id);
                    $q->where('id', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('serial_number', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('name', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('name_of_contractor', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('address', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('purpose_contractor', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('deadline_from', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('deadline_to', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('total_price', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('unit_price', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('payment_date', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('payment_terms', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('contractor_obligations', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('company_obligations', 'LIKE', '%' . request()->input('search_text') . '%');
                 
                    
                });
            }
        }
        
        if (request()->has('search_status')) {
               if (request()->input('search_status') == 99) {
                   $query->where('deadline_to', '<=', date("Y-m-d"));
               }
          }
        if(request()->has('contract_type')) {
            $query->where('contract_type_id', request()->input('contract_type'));
        }

        if (request()->has('search_order') && request()->has('search_sort')) {
            if (request()->input('search_sort') == 'ASC') {
                $query->orderBy(request()->input('search_order'), 'ASC');
            }
            if (request()->input('search_sort') == 'DESC') {
                $query->orderBy(request()->input('search_order'), 'DESC');
            }
        }
        if (request()->has('start_date')) {
            if (request()->input('start_date') != null)
                $query->where('deadline_from', request()->input('start_date'));
        }
        if (request()->has('end_date')) {
            if (request()->input('end_date') != null)
                $query->where('deadline_to', request()->input('end_date'));
        }
        if (request()->has('company')) {
            if (request()->has('procurement_officer')) {
                if (request()->input('procurement_officer') != null) {
                    $query->where('created_by', request()->input('procurement_officer'));
                }
            }
            if (request()->has('responsible_person')) {
                if (request()->input('responsible_person') != null) {
                    $query->where('responsible_person', request()->input('responsible_person'));
                }
            }
            if (request()->has('department')) {
                if (request()->input('department') != null) {
                    $query->whereHas("responsiblePerson.department", function ($q) {
                        $q->where('department_id', request()->input('department'));
                    });
                }
            } else {
                if (request()->input('company') != null) {
                    $query->whereHas("responsiblePerson.department", function ($q) {
                        $q->with("department")
                            ->where('company_id', request()->input('company'));
                    });
                }
            }
        }
        $query->where('step', 6);
        $query->where('status', 1);

        if (request()->has('page')) {
            return $query->paginate(10);
        } else {
            $query->get();
        }
        
        
//         if (request()->has('page')) {
//             return $this->model
//                 ->withTables()
//                 ->where('responsible_person', $id)
//                 ->where('step', 6)
//                 ->orWhere('status', 1)
//                 ->orderByDesc('created_at')
//                 ->paginate(10);
//         }
// 
//         return $this->model
//             ->withTables()
//             ->where('responsible_person', $id)
//             ->orderByDesc('created_at')
//             ->get();
    }

    public function getAllByProcurementOfficerId($id)
    {
        // Procurement officer only sees contracts they personally created
        $query = $this->model->withTables()->where('created_by', $id);

        if (request()->has('search_text')) {
            if (request()->input('search_text') != "null") {
                $query->where(function ($q) {
                    $q->where('id', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('serial_number', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('name', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('name_of_contractor', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('address', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('purpose_contractor', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('deadline_from', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('deadline_to', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('total_price', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('unit_price', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('payment_date', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('payment_terms', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('contractor_obligations', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('company_obligations', 'LIKE', '%' . request()->input('search_text') . '%');
                });
            }
        }
        
        if (request()->has('search_status')) {
               if (request()->input('search_status') == 99) {
                   $query->where('deadline_to', '<=', date("Y-m-d"));
               }
           }
        
        if(request()->has('contract_type')) {
            $query->where('contract_type_id', request()->input('contract_type'));
        }

        if (request()->has('search_order') && request()->has('search_sort')) {
            if (request()->input('search_sort') == 'ASC') {
                $query->orderBy(request()->input('search_order'), 'ASC');
            }
            if (request()->input('search_sort') == 'DESC') {
                $query->orderBy(request()->input('search_order'), 'DESC');
            }
        }
        if (request()->has('start_date')) {
            if (request()->input('start_date') != null)
                $query->where('deadline_from', request()->input('start_date'));
        }
        if (request()->has('end_date')) {
            if (request()->input('end_date') != null)
                $query->where('deadline_to', request()->input('end_date'));
        }
        if (request()->has('company')) {
            if (request()->has('procurement_officer')) {
                if (request()->input('procurement_officer') != null) {
                    $query->where('created_by', request()->input('procurement_officer'));
                }
            }
            if (request()->has('responsible_person')) {
                if (request()->input('responsible_person') != null) {
                    $query->where('responsible_person', request()->input('responsible_person'));
                }
            }
            if (request()->has('department')) {
                if (request()->input('department') != null) {
                    $query->whereHas("responsiblePerson.department", function ($q) {
                        $q->where('department_id', request()->input('department'));
                    });
                }
            } else {
                if (request()->input('company') != null) {
                    $query->whereHas("responsiblePerson.department", function ($q) {
                        $q->with("department")
                            ->where('company_id', request()->input('company'));
                    });
                }
            }
        }

        $query->where('status', '!=', 1);

        if (request()->has('page')) {
            return $query->paginate(10);
        } else {
            $query->get();
        }


//         if (request()->has('page')) {
//             return $this->model
//                 ->withTables()
//                 ->where('created_by', $id)
//                 ->orderByDesc('created_at')
//                 ->paginate(10);
//         }
// 
//         return $this->model
//             ->withTables()
//             ->where('created_by', $id)
//             ->orderByDesc('created_at')
//             ->paginate(10);
    }

    public function getAllByDirectorDepartmentId($id)
    {
        
        $query = $this->model->withTables();

        if (request()->has('search_text')) {
            if (request()->input('search_text') != "null") {
                $query->where(function ($q) {
                    $q->where('department_id', $id);
                    $q->where('id', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('serial_number', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('name', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('name_of_contractor', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('address', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('purpose_contractor', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('deadline_from', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('deadline_to', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('total_price', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('unit_price', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('payment_date', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('payment_terms', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('contractor_obligations', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('company_obligations', 'LIKE', '%' . request()->input('search_text') . '%');
                 
                    
                });
            }
        }
        
        if (request()->has('search_status')) {
               if (request()->input('search_status') == 99) {
                   $query->where('deadline_to', '<=', date("Y-m-d"));
               }
           }
        
        if(request()->has('contract_type')) {
            $query->where('contract_type_id', request()->input('contract_type'));
        }

        if (request()->has('search_order') && request()->has('search_sort')) {
            if (request()->input('search_sort') == 'ASC') {
                $query->orderBy(request()->input('search_order'), 'ASC');
            }
            if (request()->input('search_sort') == 'DESC') {
                $query->orderBy(request()->input('search_order'), 'DESC');
            }
        }
        if (request()->has('start_date')) {
            if (request()->input('start_date') != null)
                $query->where('deadline_from', request()->input('start_date'));
        }
        if (request()->has('end_date')) {
            if (request()->input('end_date') != null)
                $query->where('deadline_to', request()->input('end_date'));
        }
        if (request()->has('company')) {
            if (request()->has('procurement_officer')) {
                if (request()->input('procurement_officer') != null) {
                    $query->where('created_by', request()->input('procurement_officer'));
                }
            }
            if (request()->has('responsible_person')) {
                if (request()->input('responsible_person') != null) {
                    $query->where('responsible_person', request()->input('responsible_person'));
                }
            }
            if (request()->has('department')) {
                if (request()->input('department') != null) {
                    $query->whereHas("responsiblePerson.department", function ($q) {
                        $q->where('department_id', request()->input('department'));
                    });
                }
            } else {
                if (request()->input('company') != null) {
                    $query->whereHas("responsiblePerson.department", function ($q) {
                        $q->with("department")
                            ->where('company_id', request()->input('company'));
                    });
                }
            }
        }
        // $query->Where('step', '>=', '2');
        $user_id = auth()->user()->id;
        $query->where('status', '!=', 1);
        $query->where('responsible_person', '=', $user_id);

        if (request()->has('page')) {
            return $query->paginate(10);
        } else {
            $query->get();
        }
        
        
//         if (request()->has('page')) {
//             return $this->model
//                 ->withTables()
//                 ->where('department_id', $id)
//                 ->orderByDesc('created_at')
//                 ->paginate(10);
//         }
// 
//         return $this->model
//             ->withTables()
//             ->where('department_id', $id)
//             ->orderByDesc('created_at')
//             ->paginate(10);
    }

    public function getAllByExecutiveDirector()
    {
        
        
        $query = $this->model->withTables();

        if (request()->has('search_text')) {
            if (request()->input('search_text') != "null") {
                $query->where(function ($q) {
                    // $q->where('created_by', $id);
                    $q->where('id', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('serial_number', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('name', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('name_of_contractor', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('address', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('purpose_contractor', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('deadline_from', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('deadline_to', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('total_price', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('unit_price', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('payment_date', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('payment_terms', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('contractor_obligations', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('company_obligations', 'LIKE', '%' . request()->input('search_text') . '%');
                 
                    
                });
            }
        }
        if (request()->has('search_status')) {
               if (request()->input('search_status') == 99) {
                   $query->where('deadline_to', '<=', date("Y-m-d"));
               }
           }
        
        if(request()->has('contract_type')) {
            $query->where('contract_type_id', request()->input('contract_type'));
        }

        if (request()->has('search_order') && request()->has('search_sort')) {
            if (request()->input('search_sort') == 'ASC') {
                $query->orderBy(request()->input('search_order'), 'ASC');
            }
            if (request()->input('search_sort') == 'DESC') {
                $query->orderBy(request()->input('search_order'), 'DESC');
            }
        }
        if (request()->has('start_date')) {
            if (request()->input('start_date') != null)
                $query->where('deadline_from', request()->input('start_date'));
        }
        if (request()->has('end_date')) {
            if (request()->input('end_date') != null)
                $query->where('deadline_to', request()->input('end_date'));
        }
        if (request()->has('company')) {
            if (request()->has('procurement_officer')) {
                if (request()->input('procurement_officer') != null) {
                    $query->where('created_by', request()->input('procurement_officer'));
                }
            }
            if (request()->has('responsible_person')) {
                if (request()->input('responsible_person') != null) {
                    $query->where('responsible_person', request()->input('responsible_person'));
                }
            }
            if (request()->has('department')) {
                if (request()->input('department') != null) {
                    $query->whereHas("responsiblePerson.department", function ($q) {
                        $q->where('department_id', request()->input('department'));
                    });
                }
            } else {
                if (request()->input('company') != null) {
                    $query->whereHas("responsiblePerson.department", function ($q) {
                        $q->with("department")
                            ->where('company_id', request()->input('company'));
                    });
                }
            }
        }
        // Legacy chain: CEO sees from step 2+. With a workflow template the
        // template itself dictates whether CEO is on the path, so don't
        // filter those out by step.
        $query->where(function ($q) {
            $q->whereNotNull('workflow_template_id');
            $q->orWhere('step', '>=', '2');
        });
        $query->where('status', '!=', 1);

        if (request()->has('page')) {
            return $query->paginate(10);
        } else {
            $query->get();
        }
        
        
//         if (request()->has('page')) {
//             return $this->model
//                 ->withTables()
//                 ->where('status', '!=', "1")
//                 ->where('step', '>=', '2')
//                 ->orderByDesc('created_at')
//                 ->paginate(10);
//         }
// 
//         return $this->model
//             ->withTables()
//             ->where('status', '!=', "1")
//             ->where('step', '>=', '2')
//             ->orderByDesc('created_at')
//             ->paginate(10);
    }

    public function getAllByLegalOffice($userId = null)
    {
        $query = $this->model->withTables();

        if (request()->has('search_text')) {
            if (request()->input('search_text') != "null") {
                $query->where(function ($q) {
                    // $q->where('created_by', $id);
                    $q->where('id', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('serial_number', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('name', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('name_of_contractor', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('address', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('purpose_contractor', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('deadline_from', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('deadline_to', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('total_price', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('unit_price', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('payment_date', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('payment_terms', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('contractor_obligations', 'LIKE', '%' . request()->input('search_text') . '%');
                    $q->orWhere('company_obligations', 'LIKE', '%' . request()->input('search_text') . '%');
                 
                    
                });
            }
        }
        
        if (request()->has('search_status')) {
               if (request()->input('search_status') == 99) {
                   $query->where('deadline_to', '<=', date("Y-m-d"));
               }
           }
        
        if(request()->has('contract_type')) {
            $query->where('contract_type_id', request()->input('contract_type'));
        }

        if (request()->has('search_order') && request()->has('search_sort')) {
            if (request()->input('search_sort') == 'ASC') {
                $query->orderBy(request()->input('search_order'), 'ASC');
            }
            if (request()->input('search_sort') == 'DESC') {
                $query->orderBy(request()->input('search_order'), 'DESC');
            }
        }
        if (request()->has('start_date')) {
            if (request()->input('start_date') != null)
                $query->where('deadline_from', request()->input('start_date'));
        }
        if (request()->has('end_date')) {
            if (request()->input('end_date') != null)
                $query->where('deadline_to', request()->input('end_date'));
        }
        if (request()->has('company')) {
            if (request()->has('procurement_officer')) {
                if (request()->input('procurement_officer') != null) {
                    $query->where('created_by', request()->input('procurement_officer'));
                }
            }
            if (request()->has('responsible_person')) {
                if (request()->input('responsible_person') != null) {
                    $query->where('responsible_person', request()->input('responsible_person'));
                }
            }
            if (request()->has('department')) {
                if (request()->input('department') != null) {
                    $query->whereHas("responsiblePerson.department", function ($q) {
                        $q->where('department_id', request()->input('department'));
                    });
                }
            } else {
                if (request()->input('company') != null) {
                    $query->whereHas("responsiblePerson.department", function ($q) {
                        $q->with("department")
                            ->where('company_id', request()->input('company'));
                    });
                }
            }
        }
        // Legacy chain: Legal Office sees from step 3+ (or contracts they
        // created). With a workflow template the template itself dictates
        // whether Legal Office is on the path.
        $query->where(function ($q) use ($userId) {
            $q->whereNotNull('workflow_template_id');
            $q->orWhere('step', '>=', '3');
            if ($userId) {
                $q->orWhere('created_by', $userId);
            }
        });
        $query->where('status', '!=', 1);

        if (request()->has('page')) {
            return $query->paginate(10);
        } else {
            $query->get();
        }




//         if (request()->has('page')) {
//             return $this->model
//                 ->withTables()
//                 ->where('status', '!=', "1")
//                 ->orWhere('step', '>=', '3')
//                 ->orderByDesc('created_at')
//                 ->paginate(10);
//         }
// 
//         return $this->model
//             ->withTables()
//             ->where('status', 1)
//             ->orWhere('step', '>=', '3')
//             ->orderByDesc('created_at')
//             ->paginate(10);
    }
    public function getArchivedByLegalOffice()
    {
     
        if (request()->has('page')) {
            return $this->model
                ->withTables()
                ->where('status', 1)
                // ->orWhere('step', '>=', '3')
                ->orderByDesc('created_at')
                ->paginate(10);
        }

        return $this->model
            ->withTables()
            ->where('status', 1)
            ->orWhere('step', '>=', '3')
            ->orderByDesc('created_at')
            ->paginate(10);
    }
    

    public function findById($id)
    {
        return $this->model
            ->withTables()
            ->find($id);
    }
    
    public function getAllContracts($userId)
    {
        
        if(Auth::user()->hasRole([Roles::LEGAL_OFFICE, Roles::EXECUTIVE_DIRECTOR, Roles::SUPER_ADMIN])){
            return $this->model->count();
        }
        return $this->model->where('created_by', $userId)->count();
    }
    
    public function getAllActiveContracts($userId)
    {
        if(Auth::user()->hasRole([Roles::LEGAL_OFFICE, Roles::EXECUTIVE_DIRECTOR, Roles::SUPER_ADMIN])){
            return $this->model->where('status', 5)->where('deadline_to', '>=', Carbon::now())->count();
        }
        return $this->model->where('created_by', $userId)->where('status', 5)->where('deadline_to', '>=', Carbon::now())->count();
    }
    
    public function getAllExpiredContracts($userId)
    {
        if(Auth::user()->hasRole([Roles::LEGAL_OFFICE, Roles::EXECUTIVE_DIRECTOR, Roles::SUPER_ADMIN])){
            return $this->model->where('deadline_to', '<', Carbon::now())->count();
        }
        return $this->model->where('created_by', $userId)->where('deadline_to', '<', Carbon::now())->count();
    }
    
    public function getAllExpiringContracts($userId)
    {
        if(Auth::user()->hasRole([Roles::LEGAL_OFFICE, Roles::EXECUTIVE_DIRECTOR, Roles::SUPER_ADMIN])){
            return $this->model->where('deadline_to', '>=', Carbon::now())->where('deadline_to', '<=', Carbon::now()->addMonth())->count();
        }   
        return $this->model->where('created_by', $userId)->where('deadline_to', '>=', Carbon::now())->where('deadline_to', '<=', Carbon::now()->addMonth())->count();
    }
}
