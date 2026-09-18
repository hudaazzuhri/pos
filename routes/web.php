<?php

use App\Http\Controllers\Auth\RegisterTenantController;
use App\Http\Controllers\CashDrawerController;
use App\Http\Controllers\CashierShiftController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\GrossProfitReportController;
use App\Http\Controllers\OutletController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StockOpnameController;
use App\Http\Controllers\StoreSettingController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VoidTransactionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

// --------------------------------------------------------------------------
// 1. PUBLIC & AUTHENTICATION ROUTES
// --------------------------------------------------------------------------
Route::get('/register', [RegisterTenantController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [RegisterTenantController::class, 'register'])->name('register.store');

// --------------------------------------------------------------------------
// 2. PROTECTED ROUTES (Membutuhkan Login)
// --------------------------------------------------------------------------
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/', fn () => redirect()->route('dashboard'));
    Route::middleware('role:owner,manager')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    });

    // ----------------------------------------------------------------------
    // A. TERMINAL KASIR (POS FRONT-END)
    // ----------------------------------------------------------------------
    Route::prefix('pos')->name('pos.')->group(function () {
        // Layar Utama Kasir
        Route::get('/', [TransactionController::class, 'posTerminal'])->name('terminal');

        // Open/Close Shift Kasir
        Route::resource('/shift', CashierShiftController::class);
        Route::post('/shift/open', [CashierShiftController::class, 'openShift'])->name('shift.open');
        Route::post('/shift/close', [CashierShiftController::class, 'closeShift'])->name('shift.close');

        // Checkout & Void
        Route::post('/checkout', [TransactionController::class, 'store'])->name('checkout');
        Route::post('/transactions/{transaction}/void', [VoidTransactionController::class, 'store'])->name('void');
        Route::post('/cash-drawer/open-manual', [CashDrawerController::class, 'openManual'])->name('cash-drawer.open-manual');
        Route::post('/cash-drawer/movement', [CashDrawerController::class, 'storeMovement'])->name('cash-drawer.movement');
    });

    // ----------------------------------------------------------------------
    // B. MANAJEMEN PRODUK (OWNER / MANAGER)
    // ----------------------------------------------------------------------
    Route::delete('products/bulk-delete', [ProductController::class, 'bulkDelete'])->name('products.bulk-delete');
    Route::delete('categories/bulk-delete', [CategoryController::class, 'bulkDelete'])->name('categories.bulk-delete');
    Route::resource('products', ProductController::class);
    Route::resource('categories', CategoryController::class);
    Route::middleware('role:owner,manager')->prefix('discounts')->name('discounts.')->group(function () {
        Route::get('/', [DiscountController::class, 'index'])->name('index');
        Route::post('/', [DiscountController::class, 'store'])->name('store');
        Route::put('/{discount}', [DiscountController::class, 'update'])->name('update');
        Route::patch('/{discount}/toggle-status', [DiscountController::class, 'toggleStatus'])->name('toggleStatus');
        Route::delete('/{discount}', [DiscountController::class, 'destroy'])->name('destroy');
    });
    Route::resource('customers', CustomerController::class);
    Route::post('/shift/open', [CashierShiftController::class, 'openShift'])->name('shift.open');

    Route::middleware('role:owner,manager')->prefix('employees')->name('employees.')->group(function () {
        Route::get('/', [EmployeeController::class, 'index'])->name('index');
        Route::post('/', [EmployeeController::class, 'store'])->name('store');
        Route::put('/{employee}', [EmployeeController::class, 'update'])->name('update');
        Route::patch('/{employee}/toggle-status', [EmployeeController::class, 'toggleStatus'])->name('toggle-status');
        Route::delete('/{employee}', [EmployeeController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('stock-opname')->name('stock-opname.')->group(function () {
        Route::get('/', [StockOpnameController::class, 'index'])->name('index');
        Route::get('/create', [StockOpnameController::class, 'create'])->name('create');
        Route::post('/', [StockOpnameController::class, 'store'])->name('store');
        Route::get('/{opname}', [StockOpnameController::class, 'show'])->name('show');
        Route::post('/{opname}/adjust', [StockOpnameController::class, 'adjust'])->name('adjust');
    });

    // ----------------------------------------------------------------------
    // C. LAPORAN & HISTORI TRANSAKSI
    // ----------------------------------------------------------------------
    Route::middleware('role:owner,manager')->group(function () {
        Route::prefix('stock')->name('stock.')->group(function () {
            Route::get('/', [StockController::class, 'index'])->name('index');
            Route::get('/adjustment', [StockController::class, 'createAdjustment'])->name('adjustments.create');
            Route::post('/adjustment', [StockController::class, 'storeAdjustment'])->name('adjustments.store');
            Route::get('/movements', [StockController::class, 'movements'])->name('movements.index');
        });
        Route::get('/reports/sales', [ReportController::class, 'index'])->name('reports.sales');
        Route::get('/reports/sales/export-excel', [ReportController::class, 'exportExcel'])->name('reports.sales.excel');
        Route::get('/reports/sales/export-pdf', [ReportController::class, 'exportPdf'])->name('reports.sales.pdf');
    });
    Route::middleware('role:owner')->group(function () {
        Route::get('/reports/gross-profit', [GrossProfitReportController::class, 'index'])->name('reports.gross-profit');
        Route::get('/reports/gross-profit/export-excel', [GrossProfitReportController::class, 'exportExcel'])->name('reports.gross-profit.excel');
        Route::get('/reports/gross-profit/export-pdf', [GrossProfitReportController::class, 'exportPdf'])->name('reports.gross-profit.pdf');
    });

    Route::prefix('reports')->name('reports.')->group(function () {
        Route::post('/audit-logs', [ReportController::class, 'auditLogs'])->name('audit-logs');

    });
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');

    // ----------------------------------------------------------------------
    // D. TENANT & PROFIL USER
    // ----------------------------------------------------------------------
    Route::resource('outlets', OutletController::class);
    Route::resource('users', UserController::class);
    Route::resource('subscriptions', SubscriptionController::class);
    Route::get('/settings', [StoreSettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [StoreSettingController::class, 'update'])->name('settings.update');

});

require __DIR__.'/auth.php';
