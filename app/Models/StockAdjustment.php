<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use App\Traits\HasAuditActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;

class StockAdjustment extends Model
{
    use BelongsToTenant, HasAuditActivity, LogsActivity;

    protected $fillable = [
        'tenant_id',
        'outlet_id',
        'user_id',
        'adjustment_number',
        'type',
        'total_items',
        'notes',
    ];

    protected function casts(): array
    {
        return ['total_items' => 'integer'];
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
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
