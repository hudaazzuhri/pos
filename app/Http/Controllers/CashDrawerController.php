<?php

namespace App\Http\Controllers;

use App\Models\CashDrawerLog;
use App\Models\CashierShift;
use App\Models\CashMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashDrawerController extends Controller
{
    public function openManual(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $shift = $this->activeShift($user->id);

        if (! $shift) {
            return response()->json([
                'message' => 'Tidak ada shift kasir yang aktif.',
            ], 422);
        }

        CashDrawerLog::create([
            'tenant_id' => $user->tenant_id,
            'outlet_id' => $shift->outlet_id,
            'cashier_shift_id' => $shift->id,
            'user_id' => $user->id,
            'action_type' => 'manual_open',
            'reason' => $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laci uang berhasil dibuka.',
        ]);
    }

    public function storeMovement(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:in,out'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'notes' => ['required', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $shift = $this->activeShift($user->id);

        if (! $shift) {
            return response()->json([
                'message' => 'Tidak ada shift kasir yang aktif.',
            ], 422);
        }

        CashMovement::create([
            'tenant_id' => $user->tenant_id,
            'cashier_shift_id' => $shift->id,
            'user_id' => $user->id,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'notes' => $validated['notes'],
        ]);

        CashDrawerLog::create([
            'tenant_id' => $user->tenant_id,
            'outlet_id' => $shift->outlet_id,
            'cashier_shift_id' => $shift->id,
            'user_id' => $user->id,
            'action_type' => $validated['type'] === 'in' ? 'paid_in' : 'paid_out',
            'reason' => $validated['notes'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pergerakan kas berhasil disimpan.',
        ]);
    }

    private function activeShift(int $userId): ?CashierShift
    {
        return CashierShift::query()
            ->where('user_id', $userId)
            ->where('status', 'open')
            ->whereNull('closed_at')
            ->latest('opened_at')
            ->first();
    }
}
