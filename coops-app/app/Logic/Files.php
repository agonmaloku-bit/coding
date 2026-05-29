<?php

namespace App\Logic;

use App\Facades\UserAuth;
use Illuminate\Support\Str;

class Files
{
    /**
     * @param $request
     * @param \Illuminate\Database\Eloquent\Model $model
     */
    public static function saveAttachments($request, \Illuminate\Database\Eloquent\Model $model, $step = '0'): void
    {
        $files = $request->file('files');

        // Accept a single 'file' input as well so callers (such as the
        // contract approve endpoint) that send one attachment per request
        // get persisted just like multi-file payloads.
        if (empty($files)) {
            $single = $request->file('file');
            if ($single) {
                $files = [$single];
            }
        }

        if (empty($files)) {
            return;
        }

        foreach ($files as $file) {

            $fileExtension = $file->extension();
            $fileName = Str::uuid()->toString();
            $publicFileName = $file->getClientOriginalName();
            $filePath = 'contracts/' . $model->id;
            $file->storeAs(
                $filePath,
                $fileName . '.' . $fileExtension
            );
            $model->files()->create([
                'file_id' => $fileName,
                'file_name' => $publicFileName,
                'file_extension' => $fileExtension,
                'file_path' => $filePath,
                'step' => (string) $step,
                'user_id' => UserAuth::getUserId(),
            ]);
        }
    }
    public static function saveBillAttachments($request, \Illuminate\Database\Eloquent\Model $model, $step = '0'): void
    {
        $files = $request->file('files');

        if (empty($files)) {
            $single = $request->file('file');
            if ($single) {
                $files = [$single];
            }
        }

        if (empty($files)) {
            return;
        }

        foreach ($files as $file) {

            $fileExtension = $file->extension();
            $fileName = Str::uuid()->toString();
            $publicFileName = $file->getClientOriginalName();
            $filePath = 'bills/' . $model->id;
            $file->storeAs(
                $filePath,
                $fileName . '.' . $fileExtension
            );
            $model->files()->create([
                'file_id' => $fileName,
                'file_name' => $publicFileName,
                'file_extension' => $fileExtension,
                'file_path' => $filePath,
                'step' => (string) $step,
                'user_id' => UserAuth::getUserId(),
            ]);
        }
    }
}