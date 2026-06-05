<?php

use Illuminate\Support\Facades\Route;
use Maatwebsite\Excel\Facades\Excel;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/', function () {
//     return Redirect::away('https://pmk.artmotion.net');
// });
//NEEEEEEEEEW  NEW NEW
Route::get('{any}', function () {
    return view('app');
})->where('any', '.*');

Route::get('/', function () {
    return view('welcome');
});

Route::get('/t', function () {
    $a = "a";
    //    return App\Models\Contract::where('id', 'LIKE', '%' . $a . '%')
//        ->orWhere('name', 'LIKE', '%' . request()->input('search_text') . '%')
//        ->whereHas("responsible_person.department", function ($q) {
//            $q->with("department")
//                ->where('company_id', 1);
//        })->get();

    return App\Models\Contract::where(function ($q) use ($a) {
        $q->where('id', 'LIKE', '%' . $a . '%');
        $q->orWhere('serial_number', 'LIKE', '%' . $a . '%');
        $q->orWhere('name', 'LIKE', '%' . $a . '%');
        $q->orWhere('name_of_contractor', 'LIKE', '%' . $a . '%');
        $q->orWhere('address', 'LIKE', '%' . $a . '%');
        $q->orWhere('purpose_contractor', 'LIKE', '%' . $a . '%');
        $q->orWhere('deadline_from', 'LIKE', '%' . $a . '%');
        $q->orWhere('deadline_to', 'LIKE', '%' . $a . '%');
        $q->orWhere('total_price', 'LIKE', '%' . $a . '%');
        $q->orWhere('unit_price', 'LIKE', '%' . $a . '%');
        $q->orWhere('payment_date', 'LIKE', '%' . $a . '%');
        $q->orWhere('payment_terms', 'LIKE', '%' . $a . '%');
        $q->orWhere('contractor_obligations', 'LIKE', '%' . $a . '%');
        $q->orWhere('company_obligations', 'LIKE', '%' . $a . '%');
    })

        //      ->whereHas("responsible_person.department", function ($q) {
//            $q->where('department_id', 1);
//        })
        ->where('created_by', "=", 4)
        ->orderBy('id', 'ASC')
        ->get();

    //    return App\Models\User::where('department_id', 2)
//        ->whereHas("roles", function($q){ $q->where("name", App\Enums\Roles::RESPONSIBLE_PERSON); })
//        ->get();
});


Route::get('/sm', function () {

    $contract = \App\Models\Contract::with(
        'contract_type',
        //            'company',
        'responsible_person.department.company',
        'createdBy.department.company',
        'department',
        'comments.user',
        'files'
    )->find(1);

    \Mail::to('email@gmail.com')->send(new \App\Mail\ContractAssigned($contract));

    dd("Email is Sent.");
});


Route::get('/ex', function () {
    return Excel::download(new \App\Exports\ContractsExport, 'contracts.xlsx');
});
Route::get('/exl', function () {
    return Excel::download(new \App\Exports\BillsExport, 'bills.xlsx');
});
// added new
Route::post('/logout', [\App\Http\Controllers\Api\Auth\AuthenticationController::class, 'logout'])->name('logout');