<?php

namespace App\Mediators;

use App\Http\Resources\ResponseResource;
use App\Logic\Permission;
use App\Enums\Permissions;
use App\Repositories\Contracts\ContractTemplateRepositoryInterface;
use App\Mediators\Contracts\ContractTemplateMediatorInterface;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Shared\Html;
use PhpOffice\PhpWord\TemplateProcessor;

class ContractTemplateMediator implements ContractTemplateMediatorInterface
{
    private $contractTemplateRepository;

    public function __construct(ContractTemplateRepositoryInterface $contractTemplateRepository)
    {
        $this->contractTemplateRepository = $contractTemplateRepository;
    }

    public function getAll()
    {
        if (!Permission::hasPermissionTo([Permissions::CONTRACT_TYPE_SHOW, Permissions::CONTRACT_REQUEST, Permissions::CONTRACT_APPROVE]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return $this->contractTemplateRepository->getAll();
    }

    public function findById($id)
    {
        if (!Permission::hasPermissionTo([Permissions::CONTRACT_TYPE_SHOW]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->contractTemplateRepository->find($id));
    }

    public function createContractTemplate($request)
    {
        if (!Permission::hasPermissionTo([Permissions::CONTRACT_TYPE_SHOW]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $data = $request->all();

        // The uploaded .docx (if any) is only used to seed the Quill editor
        // via extract-content. The edited HTML from Quill is the source of
        // truth. Render it to a fresh .docx (with `{{placeholders}}` kept as
        // literal text) so TemplateProcessor can fill it later and so the
        // downloaded document always matches what the user edited.
        $data['file_path'] = $this->renderHtmlToTemplateDocx(
            $data['content'] ?? '',
            $data['name'] ?? 'template'
        );

        // Fallback: if HTML render produced nothing (empty content) but a
        // file was uploaded, keep the uploaded file so the template is not
        // left without a .docx source.
        if (!$data['file_path'] && $request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('contract_templates', $filename, 'public');
            $data['file_path'] = 'contract_templates/' . $filename;
        }

        return ResponseResource::make($this->contractTemplateRepository->store($data));
    }

    public function editContractTemplateById($request, $id)
    {
        if (!Permission::hasPermissionTo([Permissions::CONTRACT_TYPE_EDIT]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $data = $request->all();

        // Regenerate the backing .docx from the edited Quill HTML so the
        // download always reflects the editor content. See createContractTemplate.
        $rendered = $this->renderHtmlToTemplateDocx(
            $data['content'] ?? '',
            $data['name'] ?? 'template'
        );
        if ($rendered) {
            $data['file_path'] = $rendered;
        } elseif ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('contract_templates', $filename, 'public');
            $data['file_path'] = 'contract_templates/' . $filename;
        }

        $result = $this->contractTemplateRepository->update($id, $data);
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }

    public function deleteContractTemplateById($id)
    {
        if (!Permission::hasPermissionTo([Permissions::CONTRACT_TYPE_DELETE]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->contractTemplateRepository->destroy($id);
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }

    public function getByContractType($contractTypeId)
    {
        if (!Permission::hasPermissionTo([Permissions::CONTRACT_TYPE_SHOW, Permissions::CONTRACT_REQUEST]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->contractTemplateRepository->getByContractType($contractTypeId));
    }

    public function fillTemplate($id, $request)
    {
        if (!Permission::hasPermissionTo([Permissions::CONTRACT_REQUEST]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $template = $this->contractTemplateRepository->find($id);
        if (!$template) {
            return response(['message' => 'Template not found'], 404);
        }

        $content = $template->content;
        $variables = $request->input('variables', []);

        // Resolve company fields from company_id if not provided in variables
        $companyId = $request->input('company_id');
        if ($companyId) {
            $company = \App\Models\Company::find($companyId);
            if ($company) {
                if (empty($variables['company_name'])) $variables['company_name'] = $company->name ?? '';
                if (empty($variables['company_business_no'])) $variables['company_business_no'] = $company->business_no ?? '';
                if (empty($variables['company_address'])) $variables['company_address'] = $company->address ?? '';
            }
        }

        // Resolve role-based user names from the company's departments
        if ($companyId) {
            $departmentIds = \App\Models\Department::where('company_id', $companyId)->pluck('id');

            // CEO = Executive Director role
            if (empty($variables['ceo_name'])) {
                $user = \App\Models\User::whereIn('department_id', $departmentIds)
                    ->whereHas('roles', fn($q) => $q->where('name', 'Executive Director'))->first();
                if ($user) $variables['ceo_name'] = $user->first_name . ' ' . $user->last_name;
            }

            // Legal = Legal Office role
            if (empty($variables['legal_name'])) {
                $user = \App\Models\User::whereIn('department_id', $departmentIds)
                    ->whereHas('roles', fn($q) => $q->where('name', 'Legal Office'))->first();
                if ($user) $variables['legal_name'] = $user->first_name . ' ' . $user->last_name;
            }

            // Procurement = Procurement Officer role or user in Procurement dept
            if (empty($variables['procurement_name'])) {
                $user = \App\Models\User::whereIn('department_id', $departmentIds)
                    ->whereHas('roles', fn($q) => $q->where('name', 'Procurement Officer'))->first();
                if (!$user) {
                    $procDept = \App\Models\Department::where('company_id', $companyId)
                        ->where('name', 'like', '%Procurement%')->first();
                    if ($procDept) $user = \App\Models\User::where('department_id', $procDept->id)->first();
                }
                if ($user) $variables['procurement_name'] = $user->first_name . ' ' . $user->last_name;
            }

            // CTO = Director of Technical department
            if (empty($variables['cto_name'])) {
                $techDept = \App\Models\Department::where('company_id', $companyId)
                    ->where('name', 'like', '%Technical%')->orWhere('name', 'like', '%IT%')->first();
                if ($techDept) {
                    $user = \App\Models\User::where('department_id', $techDept->id)->first();
                    if ($user) $variables['cto_name'] = $user->first_name . ' ' . $user->last_name;
                }
            }

            // CFO = Director of Finance department
            if (empty($variables['cfo_name'])) {
                $finDept = \App\Models\Department::where('company_id', $companyId)
                    ->where('name', 'like', '%Financ%')->first();
                if ($finDept) {
                    $user = \App\Models\User::where('department_id', $finDept->id)->first();
                    if ($user) $variables['cfo_name'] = $user->first_name . ' ' . $user->last_name;
                }
            }
        }

        // Resolve created_by from authenticated user
        if (empty($variables['created_by'])) {
            $authUser = auth()->user();
            if ($authUser) {
                $variables['created_by'] = $authUser->first_name . ' ' . $authUser->last_name;
            }
        }

        foreach ($variables as $key => $value) {
            // Skip company_logo - it's handled during .docx generation as an image
            if ($key === 'company_logo') continue;
            $content = str_replace('{{' . $key . '}}', $value ?? '', $content);
        }

        // If download=true, generate .docx, save to temp storage and return download token
        if ($request->input('download')) {
            $companyId = $request->input('company_id');
            // If the template has an uploaded .docx file, fill it natively to preserve formatting
            if ($template->file_path) {
                return $this->fillDocxWithTemplateProcessor($template->file_path, $variables, $template->name);
            }
            return $this->generateDocxToStorage($content, $template->name, $companyId);
        }

        return ResponseResource::make([
            'content' => $content,
            'template_name' => $template->name,
        ]);
    }

    public function downloadTemp($token)
    {
        $tempDir = storage_path('app/public/temp');
        // Find the file matching the token
        $files = glob($tempDir . '/' . $token . '_*');
        if (empty($files) || !file_exists($files[0])) {
            return response(['message' => 'File not found or expired'], 404);
        }

        $filePath = $files[0];
        $originalName = substr(basename($filePath), strlen($token) + 1);

        return response()->download($filePath, $originalName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ])->deleteFileAfterSend(true);
    }

    public function extractFileContent($request)
    {
        if (!Permission::hasPermissionTo([Permissions::CONTRACT_TYPE_SHOW]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        if (!$request->hasFile('file')) {
            return response(['message' => 'No file provided'], 422);
        }

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $content = '';

        if ($extension === 'txt') {
            $raw = file_get_contents($file->getRealPath());
            // Convert plain text to HTML paragraphs
            $lines = explode("\n", $raw);
            $content = '';
            foreach ($lines as $line) {
                $line = trim($line);
                $content .= '<p>' . e($line) . '</p>';
            }
        } elseif ($extension === 'docx') {
            try {
                $phpWord = IOFactory::load($file->getRealPath());
                $htmlWriter = IOFactory::createWriter($phpWord, 'HTML');
                ob_start();
                $htmlWriter->save('php://output');
                $fullHtml = ob_get_clean();

                // Extract body content only
                if (preg_match('/<body[^>]*>(.*?)<\/body>/si', $fullHtml, $matches)) {
                    $content = $matches[1];
                } else {
                    $content = $fullHtml;
                }
            } catch (\Exception $e) {
                return response(['message' => 'Failed to read document: ' . $e->getMessage()], 422);
            }
        } elseif ($extension === 'doc') {
            return response(['message' => 'Only .docx and .txt files are supported. Please convert .doc to .docx first.'], 422);
        } else {
            return response(['message' => 'Unsupported file type. Please upload a .docx or .txt file.'], 422);
        }

        return ResponseResource::make(['content' => $content]);
    }

    private function fillDocxWithTemplateProcessor($storedPath, $variables, $templateName)
    {
        $filePath = storage_path('app/public/' . $storedPath);
        if (!file_exists($filePath)) {
            return response(['message' => 'Template file not found'], 404);
        }

        $templateProcessor = new TemplateProcessor($filePath);
        $templateProcessor->setMacroChars('{{', '}}');

        foreach ($variables as $key => $value) {
            if ($key === 'company_logo') continue;
            try {
                $templateProcessor->setValue($key, htmlspecialchars($value ?? '', ENT_XML1, 'UTF-8'));
            } catch (\Exception $e) {
                // Variable not present in the document — skip silently
            }
        }

        $filename = str_replace(' ', '_', $templateName) . '_filled.docx';
        $token = bin2hex(random_bytes(16));
        $tempDir = storage_path('app/public/temp');
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        $tempFile = $tempDir . '/' . $token . '_' . $filename;
        $templateProcessor->saveAs($tempFile);

        // Clean up old temp files (older than 1 hour)
        foreach (glob($tempDir . '/*') as $file) {
            if (filemtime($file) < time() - 3600) {
                @unlink($file);
            }
        }

        return ResponseResource::make([
            'download_token' => $token,
            'filename' => $filename,
        ]);
    }

    private function generateDocxToStorage($htmlContent, $templateName, $companyId = null)
    {
        $phpWord = new PhpWord();
        $section = $phpWord->addSection();

        // Find company logo path if available
        $logoPath = null;
        if ($companyId) {
            $company = \App\Models\Company::find($companyId);
            if ($company && $company->logo) {
                $path = storage_path('app/public/' . $company->logo);
                if (file_exists($path)) {
                    $logoPath = $path;
                }
            }
        }

        // Handle {{company_logo}} placeholder - replace with actual image
        if ($logoPath && strpos($htmlContent, '{{company_logo}}') !== false) {
            $parts = explode('{{company_logo}}', $htmlContent);
            foreach ($parts as $i => $part) {
                $part = trim($part);
                if (!empty($part)) {
                    $this->addHtmlToSection($section, $part);
                }
                if ($i < count($parts) - 1) {
                    $section->addImage($logoPath, [
                        'width' => 150,
                        'height' => 75,
                        'alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER,
                    ]);
                }
            }
        } else {
            $htmlContent = str_replace('{{company_logo}}', '', $htmlContent);

            if ($logoPath) {
                $header = $section->addHeader();
                $header->addImage($logoPath, [
                    'width' => 120,
                    'height' => 60,
                    'alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER,
                ]);
            }

            $this->addHtmlToSection($section, $htmlContent);
        }

        $filename = str_replace(' ', '_', $templateName) . '_filled.docx';
        $token = bin2hex(random_bytes(16));
        $tempDir = storage_path('app/public/temp');
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        $tempFile = $tempDir . '/' . $token . '_' . $filename;

        $writer = IOFactory::createWriter($phpWord, 'Word2007');
        $writer->save($tempFile);

        // Clean up old temp files (older than 1 hour)
        foreach (glob($tempDir . '/*') as $file) {
            if (filemtime($file) < time() - 3600) {
                @unlink($file);
            }
        }

        return ResponseResource::make([
            'download_token' => $token,
            'filename' => $filename,
        ]);
    }

    private function sanitizeHtmlForWord($html)
    {
        // Convert <br> to <br/> (self-closing for XHTML compatibility)
        $html = preg_replace('/<br\s*>/i', '<br/>', $html);

        // Remove empty paragraphs with only <br/> or &nbsp;
        $html = preg_replace('/<p[^>]*>\s*<br\s*\/?>\s*<\/p>/i', '', $html);

        // Replace &nbsp; with space
        $html = str_replace('&nbsp;', ' ', $html);

        // Remove Quill-specific CSS classes that PhpWord doesn't understand
        // but keep alignment classes and convert them
        $html = preg_replace_callback('/class="([^"]*)"/', function ($matches) {
            $classes = $matches[1];
            $style = '';
            if (strpos($classes, 'ql-align-center') !== false) {
                $style = 'text-align: center;';
            } elseif (strpos($classes, 'ql-align-right') !== false) {
                $style = 'text-align: right;';
            } elseif (strpos($classes, 'ql-align-justify') !== false) {
                $style = 'text-align: justify;';
            }
            return $style ? 'style="' . $style . '"' : '';
        }, $html);

        // Wrap in a root div to ensure valid XML structure
        $html = '<div>' . $html . '</div>';

        return $html;
    }

    private function addHtmlToSection($section, $html)
    {
        $sanitized = $this->sanitizeHtmlForWord($html);
        try {
            Html::addHtml($section, $sanitized, false, false);
        } catch (\Exception $e) {
            // Fallback: split into paragraphs and add as text
            $paragraphs = preg_split('/<\/p>|<br\s*\/?>/', strip_tags($html, '<strong><em><b><i>'));
            foreach ($paragraphs as $p) {
                $text = trim(strip_tags($p));
                if (!empty($text)) {
                    $section->addText($text);
                }
            }
        }
    }

    /**
     * Render the given Quill HTML (which may include `{{placeholders}}`) to
     * a .docx file on the public disk and return the relative path, or null
     * if the HTML is empty.
     */
    private function renderHtmlToTemplateDocx($html, $templateName)
    {
        $html = is_string($html) ? trim($html) : '';
        if ($html === '') {
            return null;
        }

        $phpWord = new PhpWord();
        $section = $phpWord->addSection();
        $this->addHtmlToSection($section, $html);

        $slug = preg_replace('/[^A-Za-z0-9]+/', '_', trim((string) $templateName));
        $slug = trim($slug, '_');
        if ($slug === '') {
            $slug = 'template';
        }
        $relative = 'contract_templates/' . time() . '_' . $slug . '.docx';
        $absolute = storage_path('app/public/' . $relative);

        $dir = dirname($absolute);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $writer = IOFactory::createWriter($phpWord, 'Word2007');
        $writer->save($absolute);

        return $relative;
    }
}
