<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Discount extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'type',
        'value',
        'max_discount_amount',
        'min_purchase_amount',
        'scope',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'is_active' => 'boolean',
            'value' => 'decimal:2',
            'max_discount_amount' => 'decimal:2',
            'min_purchase_amount' => 'decimal:2',
        ];
    }

    public function isActive(): bool
    {
        $now = now();

        return $this->is_active &&
            (!$this->start_date || $this->start_date <= $now) &&
            (!$this->end_date || $this->end_date >= $now);
    }

    public function scopeActive($query)
    {
        $now = now();

        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_date')
                    ->orWhere('start_date', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', $now);
            });
    }

    public function scopeInactive($query)
    {
        $now = now();

        return $query->where(function ($q) use ($now) {
            $q->where('is_active', false)
                ->orWhere(function ($q2) use ($now) {
                    $q2->whereNotNull('start_date')
                        ->where('start_date', '>', $now);
                })
                ->orWhere(function ($q3) use ($now) {
                    $q3->whereNotNull('end_date')
                        ->where('end_date', '<', $now);
                });
        });
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'discount_products', 'discount_id', 'product_id');
    }

    public function discountProducts()
    {
        return $this->hasMany(DiscountProduct::class);
    }
}
