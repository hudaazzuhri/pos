<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreSetting extends Model
{
    use BelongsToTenant;

    protected $table = 'store_setting';

    protected $fillable = [
        'tenant_id',
        'outlet_id',
        'store_name',
        'logo_path',
        'address_header',
        'phone',
        'footer_receipt_notes',
        'tax_percentage',
        'enable_tax',
        'paper_size',
        'auto_print_receipt',
    ];

    protected function casts(): array
    {
        return [
            'tax_percentage' => 'decimal:2',
            'enable_tax' => 'boolean',
            'auto_print_receipt' => 'boolean',
        ];
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }
}
