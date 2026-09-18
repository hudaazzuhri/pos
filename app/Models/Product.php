<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'category_id',
        'sku',
        'barcode',
        'name',
        'buy_price',
        'sell_price',
        'stock',
        'min_stock_alert',
        'is_active',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function discounts(): BelongsToMany
    {
        return $this->belongsToMany(Discount::class, 'discount_products');
    }

    public function activeDiscounts(): BelongsToMany
    {
        return $this->discounts()
            ->where('discounts.scope', 'product')
            ->active();
    }

    public function discountProducts(): HasMany
    {
        return $this->hasMany(DiscountProduct::class);
    }
}
