<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $this->validatedFilters($request);
        $logs = $this->query($request, $filters)
            ->with(['causer.outlet', 'subject'])
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString();

        $logs->through(fn (Activity $activity): array => $this->present($activity));
        $tenantId = $request->user()->tenant_id;

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
            'filters' => $filters,
            'users' => User::query()->where('tenant_id', $tenantId)->orderBy('name')->get(['id', 'name', 'role']),
            'modules' => Activity::query()->where('tenant_id', $tenantId)->whereNotNull('log_name')->distinct()->orderBy('log_name')->pluck('log_name')->values(),
        ]);
    }

    public function show(Request $request, int $auditLog): Response
    {
        $activity = Activity::query()
            ->where('tenant_id', $request->user()->tenant_id)
            ->with(['causer.outlet', 'subject'])
            ->findOrFail($auditLog);

        return Inertia::render('AuditLogs/Show', [
            'log' => $this->present($activity),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $this->validatedFilters($request);
        $logs = $this->query($request, $filters)->with(['causer.outlet', 'subject'])->latest('created_at')->cursor();

        return response()->streamDownload(function () use ($logs): void {
            $handle = fopen('php://output', 'wb');
            fputcsv($handle, ['Waktu', 'Staff', 'Role', 'Outlet', 'Modul', 'Event', 'Deskripsi', 'IP Address', 'User Agent']);

            foreach ($logs as $activity) {
                $log = $this->present($activity);
                fputcsv($handle, [
                    $log['created_at'],
                    $log['causer']['name'] ?? 'System',
                    $log['causer']['role'] ?? '-',
                    $log['outlet'] ?? '-',
                    $log['log_name'],
                    $log['event'],
                    $log['description'],
                    $log['metadata']['ip_address'] ?? '-',
                    $log['metadata']['user_agent'] ?? '-',
                ]);
            }

            fclose($handle);
        }, 'audit-logs-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function query(Request $request, array $filters): Builder
    {
        return Activity::query()
            ->where('tenant_id', $request->user()->tenant_id)
            ->when($filters['search'] !== '', function (Builder $query) use ($filters): void {
                $search = '%'.$filters['search'].'%';
                $query->where(function (Builder $nestedQuery) use ($search): void {
                    $nestedQuery->where('description', 'like', $search)
                        ->orWhere('properties', 'like', $search)
                        ->orWhereHas('causer', fn (Builder $causerQuery) => $causerQuery->where('name', 'like', $search));
                });
            })
            ->when($filters['user_id'] !== '', fn (Builder $query) => $query->where('causer_type', (new User)->getMorphClass())->where('causer_id', $filters['user_id']))
            ->when($filters['module'] !== '', fn (Builder $query) => $query->where('log_name', $filters['module']))
            ->when($filters['event'] !== '', fn (Builder $query) => $query->where('event', $filters['event']))
            ->when($filters['date_start'] !== '', fn (Builder $query) => $query->whereDate('created_at', '>=', $filters['date_start']))
            ->when($filters['date_end'] !== '', fn (Builder $query) => $query->whereDate('created_at', '<=', $filters['date_end']));
    }

    private function validatedFilters(Request $request): array
    {
        return array_merge([
            'search' => '',
            'user_id' => '',
            'module' => '',
            'event' => '',
            'date_start' => '',
            'date_end' => '',
        ], $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'user_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where('tenant_id', $request->user()->tenant_id)],
            'module' => ['nullable', 'string', 'max:50'],
            'event' => ['nullable', 'string', 'max:50'],
            'date_start' => ['nullable', 'date'],
            'date_end' => ['nullable', 'date', 'after_or_equal:date_start'],
        ]));
    }

    private function present(Activity $activity): array
    {
        $properties = $activity->properties?->toArray() ?? [];

        return [
            'id' => $activity->id,
            'created_at' => $activity->created_at?->toIso8601String(),
            'log_name' => $activity->log_name,
            'event' => $activity->event,
            'description' => $activity->description,
            'metadata' => $properties['metadata'] ?? [],
            'properties' => $properties,
            'subject' => $activity->subject ? ['type' => class_basename($activity->subject), 'id' => $activity->subject->getKey()] : null,
            'causer' => $activity->causer ? [
                'id' => $activity->causer->id,
                'name' => $activity->causer->name,
                'role' => $activity->causer->role,
                'outlet' => $activity->causer->outlet?->name,
            ] : null,
            'outlet' => $activity->causer?->outlet?->name ?? $this->subjectOutletName($activity),
        ];
    }

    private function subjectOutletName(Activity $activity): ?string
    {
        if (! $activity->subject || ! method_exists($activity->subject, 'outlet')) {
            return null;
        }

        return $activity->subject->outlet?->name;
    }
}
