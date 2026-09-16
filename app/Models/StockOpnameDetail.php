<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockOpnameDetail extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'stock_opname_id',
        'product_id',
        'system_stock',
        'physical_stock',
        'difference',
        'unit_buy_price',
        'total_discrepancy_value',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'system_stock' => 'integer',
            'physical_stock' => 'integer',
            'difference' => 'integer',
            'unit_buy_price' => 'decimal:2',
            'total_discrepancy_value' => 'decimal:2',
        ];
    }

    public function opname(): BelongsTo
    {
        return $this->belongsTo(StockOpname::class, 'stock_opname_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
