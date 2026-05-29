<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BillFilesResource extends JsonResource
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
            'file_id' => $this->file_id ?? null,
            'file_name' => $this->file_name ?? null,
            'file_extension' => $this->file_extension ?? null,
            // legacy typo kept so the existing print template keeps working
            'file_extenction' => $this->file_extension ?? null,
            'file_path' => $this->file_path ?? null,
            'step' => $this->step ?? null,
        ];
    }
}