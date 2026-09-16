<?php

namespace App\Http\Controllers;

use App\Models\CashierShift;
use App\Models\CashMovement;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashierShiftController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('CashierShift/Index', [
            'shifts' => CashierShift::query()
                ->with(['user:id,name', 'outlet:id,name'])
                ->latest()
                ->paginate(15)
                ->withQueryString(),
        ]);
    }

    public function openShift(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'starting_cash' => ['required', 'numeric', 'min:0'],
        ]);

        $user = $request->user();
        $hasOpenShift = CashierShift::query()
            ->where('user_id', $user->id)
            ->where('status', 'open')
            ->whereNull('closed_at')
            ->exists();

        if ($hasOpenShift) {
            return back()->withErrors([
                'starting_cash' => 'Anda masih memiliki shift yang aktif.',
            ]);
        }

        if (! $user->outlet_id) {
            return back()->withErrors([
                'starting_cash' => 'User belum memiliki outlet aktif.',
            ]);
        }

        CashierShift::create([
            'tenant_id' => $user->tenant_id,
            'outlet_id' => $user->outlet_id,
            'user_id' => $user->id,
            'starting_cash' => $validated['starting_cash'],
            'status' => 'open',
            'opened_at' => now(),
        ]);

        return redirect()->route('pos.terminal')->with('message', 'Shift berhasil dibuka.');
    }

    public function closeShift(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'actual_cash' => ['required', 'numeric', 'min:0'],
        ]);

        $user = $request->user();
        $shift = CashierShift::query()
            ->where('user_id', $user->id)
            ->where('status', 'open')
            ->whereNull('closed_at')
            ->latest('opened_at')
            ->firstOrFail();

        DB::transaction(function () use ($shift, $validated) {
            $cashSales = Transaction::query()
                ->where('user_id', $shift->user_id)
                ->where('outlet_id', $shift->outlet_id)
                ->where('payment_method', 'cash')
                ->where('status', 'completed')
                ->where('created_at', '>=', $shift->opened_at)
                ->sum('total_amount');

            $cashIn = CashMovement::query()
                ->where('cashier_shift_id', $shift->id)
                ->where('type', 'in')
                ->sum('amount');

            $cashOut = CashMovement::query()
                ->where('cashier_shift_id', $shift->id)
                ->where('type', 'out')
                ->sum('amount');

            $expectedCash = (float) $shift->starting_cash + $cashSales + $cashIn - $cashOut;
            $actualCash = (float) $validated['actual_cash'];

            $shift->update([
                'expected_cash' => $expectedCash,
                'actual_cash' => $actualCash,
                'difference' => $actualCash - $expectedCash,
                'closed_at' => now(),
                'status' => 'closed',
            ]);
        });

        return back()->with('message', 'Shift berhasil ditutup dan kas direkonsiliasi.');
    }
}
