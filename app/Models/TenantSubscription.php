<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class TenantSubscription extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'package_name',
        'max_users',
        'amount',
        'payment_status',
        'snap_token',
        'starts_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'max_users' => 'integer',
            'amount' => 'decimal:2',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }
}
