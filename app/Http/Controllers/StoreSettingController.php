<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use App\Models\StoreSetting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StoreSettingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $outlets = $this->availableOutlets($request)->get();
        $selectedOutletId = (int) ($request->integer('outlet_id') ?: $user->outlet_id ?: $outlets->first()?->id);
        $outlet = $outlets->firstWhere('id', $selectedOutletId) ?? $outlets->firstOrFail();
        $settings = StoreSetting::query()->firstOrCreate(
            [
                'tenant_id' => $user->tenant_id,
                'outlet_id' => $outlet->id,
            ],
            [
                'store_name' => $outlet->name,
                'phone' => $outlet->phone ?? '',
                'address_header' => $outlet->address ?? '',
            ],
        );

        return Inertia::render('StoreSettings/Index', [
            'outlets' => $outlets->map(fn (Outlet $availableOutlet): array => [
                'id' => $availableOutlet->id,
                'name' => $availableOutlet->name,
                'is_main' => $availableOutlet->is_main,
            ])->values(),
            'selectedOutletId' => $outlet->id,
            'storeSettings' => [
                ...$settings->toArray(),
                'logo_url' => $settings->logo_path
                    ? asset('storage/'.$settings->logo_path)
                    : null,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'outlet_id' => [
                'required',
                'integer',
                Rule::exists('outlets', 'id')->where('tenant_id', $request->user()->tenant_id),
            ],
            'store_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'address_header' => ['required', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'paper_size' => ['required', 'in:58mm,80mm'],
            'auto_print_receipt' => ['boolean'],
            'footer_receipt_notes' => ['nullable', 'string', 'max:500'],
            'enable_tax' => ['boolean'],
            'tax_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $user = $request->user();
        $outlet = $this->availableOutlets($request)
            ->whereKey($validated['outlet_id'])
            ->firstOrFail();
        $settings = StoreSetting::query()->firstOrNew([
            'tenant_id' => $user->tenant_id,
            'outlet_id' => $outlet->id,
        ]);

        $settings->fill([
            'tenant_id' => $user->tenant_id,
            'outlet_id' => $outlet->id,
            'store_name' => $validated['store_name'],
            'phone' => $validated['phone'],
            'address_header' => $validated['address_header'],
            'paper_size' => $validated['paper_size'],
            'auto_print_receipt' => $validated['auto_print_receipt'] ?? false,
            'footer_receipt_notes' => $validated['footer_receipt_notes'] ?? null,
            'enable_tax' => $validated['enable_tax'] ?? false,
            'tax_percentage' => $validated['tax_percentage'],
        ]);

        if ($request->hasFile('logo')) {
            if ($settings->logo_path) {
                Storage::disk('public')->delete($settings->logo_path);
            }

            $settings->logo_path = $request->file('logo')->store('logos', 'public');
        }

        $settings->save();

        return back()->with('message', 'Pengaturan toko berhasil disimpan.');
    }

    private function availableOutlets(Request $request): Builder
    {
        $user = $request->user();

        return Outlet::query()
            ->when(
                ! in_array($user->role, ['owner', 'manager'], true),
                fn ($query) => $query->whereKey($user->outlet_id),
            )
            ->orderByDesc('is_main')
            ->orderBy('name');
    }
}
