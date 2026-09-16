<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'product_id',
        'name',
        'sku',
        'barcode',
        'buy_price',
        'sell_price',
        'stock',
        'is_active',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
