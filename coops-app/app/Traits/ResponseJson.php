<?php

namespace App\Traits;

use App\Http\Resources\ResponseResource;

trait ResponseJson
{
    public function checkIfTrueOrFalseAndReturnResponse($result, $data = null, $message = null)
    {
        if ($result == 0 || $result == null) {
            return $this->errorResponse(null, $message != null ?: "Error");
        }
        return $this->successResponse($data, $message != null ?: "Success");
    }

    public function checkIfNullAndReturnResponse($result, $message = null)
    {
        if ($result == null) {
            return $this->errorResponse(null, $message != null ?: "Error");
        }
        return $this->successResponse($result, $message != null ?: "Success");
    }

    public function successResponse($data, $message = "Success")
    {
        return ResponseResource::make($data)->additional([
            'success' => true,
            'message' => $message,
        ]);
    }

    public function errorResponse($data = null, $message = "Error")
    {
        return ResponseResource::make($data)->additional([
            'success' => false,
            'message' => $message,
        ]);
    }
}
