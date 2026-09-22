<?php

namespace App\Traits;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;

trait HasAuditActivity
{
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly($this->auditLogAttributes())
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName($this->auditLogName())
            ->setDescriptionForEvent(fn (string $event): string => $this->auditDescription($event));
    }

    public function tapActivity(Activity $activity, string $eventName): void
    {
        $user = Auth::user();
        $tenantId = $this->tenant_id ?? $user?->tenant_id;
        $outletId = $this->outlet_id ?? $user?->outlet_id;

        $activity->tenant_id = $tenantId;
        $activity->outlet_id = $outletId;

        $properties = $activity->properties instanceof Collection
            ? $activity->properties
            : collect($activity->properties ?? []);

        $activity->properties = $properties->put('metadata', array_filter([
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'reason' => request()->input('reason'),
        ]));
    }

    protected function auditLogAttributes(): array
    {
        return match (class_basename($this)) {
            'User' => ['name', 'email', 'phone', 'role', 'outlet_id', 'is_active'],
            'Product' => ['category_id', 'sku', 'barcode', 'name', 'buy_price', 'sell_price', 'stock', 'min_stock_alert', 'is_active'],
            'Discount' => ['name', 'type', 'value', 'max_discount_amount', 'min_purchase_amount', 'scope', 'start_date', 'end_date', 'is_active'],
            'Transaction' => ['outlet_id', 'user_id', 'customer_id', 'invoice_number', 'subtotal', 'discount_amount', 'tax_amount', 'total_amount', 'paid_amount', 'change_amount', 'payment_method', 'status'],
            'StockAdjustment' => ['outlet_id', 'user_id', 'adjustment_number', 'type', 'total_items', 'notes'],
            default => ['*'],
        };
    }

    protected function auditLogName(): string
    {
        return match (class_basename($this)) {
            'User' => 'users',
            'Product' => 'products',
            'Discount' => 'discounts',
            'Transaction' => 'sales',
            'StockAdjustment' => 'inventory',
            default => 'default',
        };
    }

    private function auditDescription(string $event): string
    {
        return ucfirst($event).' '.strtolower(class_basename($this)).' #'.$this->getKey();
    }
}
