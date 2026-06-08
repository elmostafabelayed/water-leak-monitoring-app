<?php

namespace App\Http\Controllers\Api;

use App\Models\Alert;
use Illuminate\Http\Request;

class AlertController extends BaseApiController
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $alerts = Alert::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate(20);

        $data = collect($alerts->items())->map(function (Alert $a) {
            $severity = match ($a->severity) {
                'CRITICAL' => 'CRITICAL',
                'WARNING' => 'HIGH',
                default => 'LOW',
            };

            return [
                'id' => $a->id,
                'type' => $a->type,
                'message' => $a->description ?? '',
                'severity' => $severity,
                'created_at' => $a->created_at?->toIso8601String(),
                'acknowledged' => (bool) $a->is_acknowledged,
            ];
        })->values();

        return $this->success([
            'data' => $data,
            'current_page' => $alerts->currentPage(),
            'last_page' => $alerts->lastPage(),
        ]);
    }

    public function acknowledge(Request $request, int $id)
    {
        $userId = $request->user()->id;
        $alert = Alert::where('user_id', $userId)->where('id', $id)->first();
        if (!$alert) return $this->failure('Alerte introuvable', 404);

        $alert->update(['is_acknowledged' => true]);
        return $this->success(['acknowledged' => true]);
    }

    public function unreadCount(Request $request)
    {
        $userId = $request->user()->id;
        $count = Alert::where('user_id', $userId)->where('is_acknowledged', false)->count();
        return $this->success(['count' => $count]);
    }
}

