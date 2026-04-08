<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddLeadNoteRequest;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Requests\UpdateLeadRequest;
use App\Http\Requests\AuthorizeLeadActionRequest;
use App\Models\Lead;
use App\Models\LeadNote;
use App\Models\LeadStatus;
use Illuminate\Support\Facades\Auth;

class LeadController extends Controller
{
    public function index()
    {
        if (Auth::user()->isAdmin()) {
            $leads = Lead::with(['user', 'service', 'leadStatus'])->orderBy('created_at', 'desc')->get();
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
        return response()->json($lead->load(['user', 'service', 'leadStatus']));
    }

    public function update(UpdateLeadRequest $request, Lead $lead)
    {
        $validated = $request->validated();

        $lead->update($validated);

        return response()->json($lead->load(['user', 'service', 'leadStatus']));
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
}
