<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function index()
    {
        //
    }

    public function create()
    {
        //
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
            'user_id' => auth()->check() ? auth()->id() : null,
        ]);

        return response()->json([
            'message' => 'Lead created successfully',
            'lead' => $lead
        ], 201);
    }

    public function show(Lead $lead)
    {
        //
    }

    public function edit(Lead $lead)
    {
        //
    }

    public function update(Request $request, Lead $lead)
    {
        //
    }

    public function destroy(Lead $lead)
    {
        //
    }
}
