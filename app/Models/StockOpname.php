<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockOpname extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'outlet_id',
        'user_id',
        'opname_number',
        'status',
        'total_items_checked',
        'total_discrepancy_qty',
        'total_discrepancy_value',
        'notes',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'total_items_checked' => 'integer',
            'total_discrepancy_qty' => 'integer',
            'total_discrepancy_value' => 'decimal:2',
            'completed_at' => 'datetime',
        ];
    }

    public function details(): HasMany
    {
        return $this->hasMany(StockOpnameDetail::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
