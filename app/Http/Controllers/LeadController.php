<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddLeadNoteRequest;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Requests\UpdateLeadRequest;
use App\Http\Requests\AuthorizeLeadActionRequest;
use App\Models\Lead;
use App\Models\LeadNote;
use App\Models\LeadStatus;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class LeadController extends Controller
{
    public function index()
    {
        /** @var User|null $user */
        $user = Auth::user();

        if ($user?->isAdmin()) {
            $leads = Lead::with(['user', 'service', 'leadStatus', 'assignedTo', 'lockedBy'])
                ->orderBy('created_at', 'desc')
                ->get();

            $now = Carbon::now();

            $leads->transform(function (Lead $lead) use ($user, $now) {
                $lockActive = $lead->locked_by_user_id && $lead->lock_expires_at && $now->lt($lead->lock_expires_at);
                $canViewPhone = $user->isSuperAdmin() || ($lockActive && (int) $lead->locked_by_user_id === (int) $user->id);

                if (!$canViewPhone) {
                    $lead->phone = null;
                }

                return $lead;
            });
        } else {
            $leads = Lead::with(['service', 'leadStatus'])
                ->where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($leads);
    }

    public function store(StoreLeadRequest $request)
    {
        $validated = $request->validated();

        $defaultStatus = LeadStatus::where('name', 'new')->first();

        $lead = Lead::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'message' => $validated['message'] ?? null,
            'service_id' => $validated['service_id'],
            'user_id' => Auth::id() ?? null,
            'lead_status_id' => $defaultStatus?->id,
        ]);

        return response()->json($lead->load(['service', 'leadStatus']), 201);
    }

    public function show(AuthorizeLeadActionRequest $request, Lead $lead)
    {
        $lead->load(['user', 'service', 'leadStatus', 'assignedTo', 'lockedBy']);

        /** @var User|null $user */
        $user = Auth::user();

        if ($user?->isAdmin()) {
            $now = Carbon::now();
            $lockActive = $lead->locked_by_user_id && $lead->lock_expires_at && $now->lt($lead->lock_expires_at);
            $canViewPhone = $user->isSuperAdmin() || ($lockActive && (int) $lead->locked_by_user_id === (int) $user->id);

            if (!$canViewPhone) {
                $lead->phone = null;
            }
        }

        return response()->json($lead);
    }

    public function update(UpdateLeadRequest $request, Lead $lead)
    {
        $validated = $request->validated();

        $lead->update($validated);

        return response()->json($lead->load(['user', 'service', 'leadStatus', 'assignedTo', 'lockedBy']));
    }

    public function destroy(AuthorizeLeadActionRequest $request, Lead $lead)
    {
        $lead->delete();
        return response()->json(['message' => 'Заявка удалена']);
    }

    public function addNote(AddLeadNoteRequest $request, Lead $lead)
    {
        $validated = $request->validated();

        $note = LeadNote::create([
            'lead_id' => $lead->id,
            'user_id' => Auth::id(),
            'note' => $validated['note'],
        ]);

        return response()->json($note->load('user'), 201);
    }

    public function getNotes(Lead $lead)
    {
        return response()->json($lead->notes()->with('user')->get());
    }

    // ─── Admin workflow: claim/release/assign/confirm ─────────────────────
    public function claim(Request $request, Lead $lead)
    {
        /** @var User|null $user */
        $user = Auth::user();
        if (!$user || !$user->isAdmin()) {
            return response()->json(['message' => 'Доступ запрещён'], 403);
        }

        $ttlMinutes = 15;
        $now = Carbon::now();

        $result = DB::transaction(function () use ($lead, $user, $now, $ttlMinutes) {
            /** @var Lead $fresh */
            $fresh = Lead::query()->lockForUpdate()->findOrFail($lead->id);

            $lockActive = $fresh->locked_by_user_id && $fresh->lock_expires_at && $now->lt($fresh->lock_expires_at);
            $lockedByOther = $lockActive && (int) $fresh->locked_by_user_id !== (int) $user->id;

            if ($lockedByOther) {
                return ['ok' => false, 'lead' => $fresh];
            }

            $fresh->locked_by_user_id = $user->id;
            $fresh->locked_at = $now;
            $fresh->lock_expires_at = $now->copy()->addMinutes($ttlMinutes);

            if (!$fresh->assigned_to_user_id || (int) $fresh->assigned_to_user_id !== (int) $user->id) {
                $fresh->assigned_to_user_id = $user->id;
                $fresh->assigned_by_user_id = $user->id;
                $fresh->assigned_at = $now;
            }

            if ($fresh->status === 'new') {
                $fresh->status = 'in_progress';
            }

            $fresh->save();

            return ['ok' => true, 'lead' => $fresh];
        });

        if (!$result['ok']) {
            $blocked = $result['lead']->load(['lockedBy']);
            return response()->json([
                'message' => 'Заявка уже в работе у другого администратора',
                'locked_by' => $blocked->lockedBy?->name,
                'lock_expires_at' => $blocked->lock_expires_at,
            ], 409);
        }

        return response()->json(
            $result['lead']->load(['user', 'service', 'leadStatus', 'assignedTo', 'lockedBy'])
        );
    }

    public function release(Request $request, Lead $lead)
    {
        /** @var User|null $user */
        $user = Auth::user();
        if (!$user || !$user->isAdmin()) {
            return response()->json(['message' => 'Доступ запрещён'], 403);
        }

        $now = Carbon::now();

        DB::transaction(function () use ($lead, $user, $now) {
            /** @var Lead $fresh */
            $fresh = Lead::query()->lockForUpdate()->findOrFail($lead->id);

            $lockActive = $fresh->locked_by_user_id && $fresh->lock_expires_at && $now->lt($fresh->lock_expires_at);
            $isLocker = $lockActive && (int) $fresh->locked_by_user_id === (int) $user->id;

            if ($user->isSuperAdmin() || $isLocker) {
                $fresh->locked_by_user_id = null;
                $fresh->locked_at = null;
                $fresh->lock_expires_at = null;
                $fresh->save();
            }
        });

        return response()->json(['message' => 'Ок']);
    }

    public function assign(Request $request, Lead $lead)
    {
        /** @var User|null $user */
        $user = Auth::user();
        if (!$user || !$user->isAdmin()) {
            return response()->json(['message' => 'Доступ запрещён'], 403);
        }

        $data = $request->validate([
            'assigned_to_user_id' => 'nullable|exists:users,id',
        ]);

        $now = Carbon::now();

        $lead->update([
            'assigned_to_user_id' => $data['assigned_to_user_id'] ?? null,
            'assigned_by_user_id' => $user->id,
            'assigned_at' => $now,
        ]);

        return response()->json($lead->load(['user', 'service', 'leadStatus', 'assignedTo', 'lockedBy']));
    }

    public function confirm(Request $request, Lead $lead)
    {
        /** @var User|null $user */
        $user = Auth::user();
        if (!$user || !$user->isAdmin()) {
            return response()->json(['message' => 'Доступ запрещён'], 403);
        }

        $now = Carbon::now();

        $result = DB::transaction(function () use ($lead, $user, $now) {
            /** @var Lead $fresh */
            $fresh = Lead::query()->lockForUpdate()->findOrFail($lead->id);

            $lockActive = $fresh->locked_by_user_id && $fresh->lock_expires_at && $now->lt($fresh->lock_expires_at);
            $canAct = $user->isSuperAdmin() || ($lockActive && (int) $fresh->locked_by_user_id === (int) $user->id);

            if (!$canAct) {
                return ['ok' => false, 'lead' => $fresh];
            }

            $fresh->confirmed_at = $now;
            $fresh->status = 'confirmed';

            // after confirmation we can release lock
            $fresh->locked_by_user_id = null;
            $fresh->locked_at = null;
            $fresh->lock_expires_at = null;

            $fresh->save();

            return ['ok' => true, 'lead' => $fresh];
        });

        if (!$result['ok']) {
            return response()->json(['message' => 'Сначала нажмите «Начать работу»'], 409);
        }

        return response()->json($result['lead']->load(['user', 'service', 'leadStatus', 'assignedTo', 'lockedBy']));
    }
}
