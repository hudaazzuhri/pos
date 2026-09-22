<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = Auth::user();

        activity()
            ->useLog('auth')
            ->event('login')
            ->causedBy($user->getAuthIdentifier())
            ->tap(function ($activity) use ($user): void {
                $activity->tenant_id = $user?->tenant_id;
                $activity->outlet_id = $user?->outlet_id;
                $activity->properties = collect(['metadata' => array_filter([
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ])]);
            })
            ->log('User logged in');

        // Redirect berdasarkan Role
        if ($user->role == 'cashier') {
            return redirect(route('pos.terminal'));
        }

        return redirect(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if ($user) {
            activity()
                ->useLog('auth')
                ->event('logout')
                ->causedBy($user->getAuthIdentifier())
                ->tap(function ($activity) use ($user, $request): void {
                    $activity->tenant_id = $user->tenant_id;
                    $activity->outlet_id = $user->outlet_id;
                    $activity->properties = collect(['metadata' => array_filter([
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                    ])]);
                })
                ->log('User logged out');
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
