<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeadController extends Controller
{
    public function index()
    {
        if (Auth::user()->isAdmin()) {
            $leads = Lead::with(['user', 'service'])->orderBy('created_at', 'desc')->get();
        } else {
            $leads = Lead::with(['service'])
                ->where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($leads);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'message' => 'nullable|string',
            'service_id' => 'required|exists:services,id',
        ]);

        $lead = Lead::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'message' => $validated['message'] ?? null,
            'service_id' => $validated['service_id'],
            'user_id' => Auth::id(),
        ]);

        return response()->json($lead->load('service'), 201);
    }

    public function show(Lead $lead)
    {
        return response()->json($lead->load(['user', 'service']));
    }

    public function update(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'message' => 'nullable|string',
            'service_id' => 'sometimes|required|exists:services,id',
            'status' => 'nullable|string|in:new,in_progress,done,cancelled',
        ]);

        $lead->update($validated);

        return response()->json($lead->load(['user', 'service']));
    }

    public function destroy(Lead $lead)
    {
        $lead->delete();
        return response()->json(['message' => 'Заявка удалена']);
    }

    public function addNote(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'note' => 'required|string',
        ]);

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
