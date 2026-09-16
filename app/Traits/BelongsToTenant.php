<?php

namespace App\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait BelongsToTenant
{
    /**
     * Boot trait untuk mendaftarkan Global Scope & Event Listener
     */
    protected static function bootBelongsToTenant(): void
    {
        // 1. GLOBAL SCOPE: Otomatis tambahkan WHERE tenant_id = X pada setiap SELECT query
        static::addGlobalScope('tenant', function (Builder $builder) {
            $user = Auth::guard()->getUser();

            if ($user?->tenant_id) {
                $builder->where($builder->getQuery()->from.'.tenant_id', $user->tenant_id);
            }
        });

        // 2. CREATING EVENT: Otomatis isi tenant_id saat Model::create() jika belum diisi
        static::creating(function ($model) {
            $user = Auth::guard()->getUser();

            if (! $model->tenant_id && $user?->tenant_id) {
                $model->tenant_id = $user->tenant_id;
            }
        });
    }

    /**
     * Relasi opsional ke Model Tenant
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Helper Scope untuk mengabaikan filter Tenant (khusus Super Admin / Background Jobs)
     * Penggunaan: Product::withoutTenant()->get();
     */
    public function scopeWithoutTenant(Builder $query): Builder
    {
        return $query->withoutGlobalScope('tenant');
    }
}
