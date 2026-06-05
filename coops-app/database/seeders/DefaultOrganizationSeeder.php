<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Department;
use Illuminate\Database\Seeder;

class DefaultOrganizationSeeder extends Seeder
{
    public function run(): void
    {
        $companyName = trim((string) env('COMPANY_NAME', config('app.name', 'CoOPS')));
        if ($companyName === '') {
            $companyName = 'CoOPS';
        }

        $company = Company::firstOrCreate(['name' => $companyName]);

        foreach (self::defaultDepartments() as $departmentName) {
            Department::firstOrCreate([
                'name' => $departmentName,
                'company_id' => $company->id,
            ]);
        }
    }

    public static function defaultDepartments(): array
    {
        return [
            'Sales Department',
            'Technical Department',
            'Legal Office',
            'CEO',
            'Procurement',
            'Finance Department',
            'Marketing Department',
        ];
    }
}
