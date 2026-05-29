<?php

namespace Database\Seeders;

use App\Models\BusinessApp;
use Illuminate\Database\Seeder;

class BusinessAppSeeder extends Seeder
{
    public function run()
    {
        $apps = [
            [
                'key' => 'contract_process',
                'name' => 'Contract Process',
                'icon' => 'fas fa-file-contract',
                'route_path' => '/admin/apps/contracts',
                'color' => '#0ea5e9',
                'description' => 'Contract lifecycle, templates, approvals and archiving.',
                'is_existing' => true,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'key' => 'bills_invoice_process',
                'name' => 'Bills/Invoice Process',
                'icon' => 'fas fa-file-invoice-dollar',
                'route_path' => '/admin/apps/bills',
                'color' => '#10b981',
                'description' => 'Invoice handling, approvals and finance records.',
                'is_existing' => true,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'key' => 'procurement_process',
                'name' => 'Procurement Process',
                'icon' => 'fas fa-shopping-cart',
                'route_path' => '/admin/apps/procurement',
                'color' => '#f59e0b',
                'description' => 'From request intake to processing and vendor coordination.',
                'is_existing' => false,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'key' => 'employee_portal',
                'name' => 'Employee Portal',
                'icon' => 'fas fa-users',
                'route_path' => '/admin/apps/employee-portal',
                'color' => '#14b8a6',
                'description' => 'SOPs, internal regulations, and company notifications.',
                'is_existing' => false,
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'key' => 'general_tickets',
                'name' => 'General Tickets',
                'icon' => 'fas fa-ticket-alt',
                'route_path' => '/admin/apps/general-tickets',
                'color' => '#f97316',
                'description' => 'General ticketing process for cross-team support needs.',
                'is_existing' => false,
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'key' => 'work_orders',
                'name' => 'Work Orders',
                'icon' => 'fas fa-tools',
                'route_path' => '/admin/apps/work-orders',
                'color' => '#ef4444',
                'description' => 'Execution-oriented orders with assignment and completion tracking.',
                'is_existing' => false,
                'is_active' => true,
                'sort_order' => 6,
            ],
            [
                'key' => 'quality_of_service',
                'name' => 'Quality of Service',
                'icon' => 'fas fa-chart-line',
                'route_path' => '/admin/apps/quality-of-service',
                'color' => '#3b82f6',
                'description' => 'KPI tracking and service quality measurement across users.',
                'is_existing' => false,
                'is_active' => true,
                'sort_order' => 7,
            ],
        ];

        foreach ($apps as $app) {
            BusinessApp::updateOrCreate(['key' => $app['key']], $app);
        }
    }
}
