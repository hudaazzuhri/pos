<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = ['name', 'price', 'max_outlets', 'max_users', 'max_monthly_transactions', 'max_products', 'audit_retention_days'];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'max_outlets' => 'integer',
            'max_users' => 'integer',
            'max_monthly_transactions' => 'integer',
            'max_products' => 'integer',
            'audit_retention_days' => 'integer',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(TenantSubscription::class);
    }
}
