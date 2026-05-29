<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BillCommentsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name ?? null,
            'bill_id' => $this->bill_id,
            'steps' => $this->steps ?? null,
            'canceled' => $this->canceled ?? null,
            'approved_at' => $this->approved_at,
            'created_at' => $this->created_at,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'first_name' => $this->user->first_name,
                'last_name' => $this->user->last_name,
            ] : null,
            // legacy keys kept for the existing print template
            'user_id' => $this->user ? $this->user->first_name . ' ' . $this->user->last_name : null,
        ];
    }
}