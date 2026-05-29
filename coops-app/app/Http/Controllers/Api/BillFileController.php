<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Models\BillFiles;
use Illuminate\Http\Request;
use App\Mediators\Contracts\BillMediatorInterface;


class BillFileController extends Controller
{
    private $billMediator;
    public function __construct(BillMediatorInterface $billMediator)
    {
        $this->billMediator = $billMediator;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($id)
    {
        // return 'smth';

        $file = BillFiles::where('file_id', $id)
            ->first()
            ->makeVisible('file_path');
        if (is_null($file)) {
            abort(404);
        }

        $filepath = storage_path('app/' . $file->file_path . '/' . $file->file_id . '.' . $file->file_extension);
        return response()->file($filepath);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    // public function destroy($id)
    // {
    //     return $this->billMediator->RemoveFile($id);
    // }
}