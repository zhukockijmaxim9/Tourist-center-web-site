<?php

namespace App\Http\Controllers;

use App\Http\Requests\ServiceRequest;
use App\Models\Service;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::with('category')->orderBy('created_at', 'desc')->get();
        return response()->json($services);
    }

    public function store(ServiceRequest $request)
    {
        $validated = $request->validated();

        $service = Service::create($validated);

        return response()->json($service, 201);
    }

    public function show(Service $service)
    {
        $service->load(['category', 'reviews' => function($q) {
            $q->where('is_approved', true)->with('user')->latest();
        }]);

        $data = $service->toArray();

        // Calculate average rating
        $data['avg_rating'] = $service->reviews->avg('rating');
        $data['reviews_count'] = $service->reviews->count();

        // Check if the current authenticated user can leave a review
        $data['can_review'] = false;
        $data['has_reviewed'] = false;

        if (Auth::check() && !Auth::user()->isAdmin()) {
            $userId = Auth::id();

            // User must have at least one completed lead for this service
            $hasCompletedLead = Lead::where('user_id', $userId)
                ->where('service_id', $service->id)
                ->whereHas('leadStatus', fn ($q) => $q->where('name', 'done'))
                ->exists();

            // Check if user already left a review for this service
            $hasReviewed = $service->reviews()
                ->where('user_id', $userId)
                ->exists();

            $data['can_review'] = $hasCompletedLead && !$hasReviewed;
            $data['has_reviewed'] = $hasReviewed;
        }

        return response()->json($data);
    }

    public function update(ServiceRequest $request, Service $service)
    {
        $validated = $request->validated();

        $service->update($validated);

        return response()->json($service);
    }

    public function destroy(Service $service)
    {
        $service->delete();
        return response()->json(['message' => 'Услуга удалена']);
    }
}
