<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ([
            ['name' => 'Basic', 'price' => 49000, 'max_outlets' => 1, 'max_users' => 2, 'max_monthly_transactions' => 1000, 'max_products' => 300, 'audit_retention_days' => 30],
            ['name' => 'Pro', 'price' => 129000, 'max_outlets' => 3, 'max_users' => 10, 'max_monthly_transactions' => 5000, 'max_products' => 2000, 'audit_retention_days' => 90],
            ['name' => 'Enterprise', 'price' => 299000, 'max_outlets' => 10, 'max_users' => 999, 'max_monthly_transactions' => 0, 'max_products' => 0, 'audit_retention_days' => 365],
        ] as $plan) {
            Plan::query()->updateOrCreate(['name' => $plan['name']], $plan);
        }
    }
}
