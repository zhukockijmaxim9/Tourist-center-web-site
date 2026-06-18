<?php

namespace App\Http\Controllers;

use App\Http\Requests\ServiceRequest;
use App\Models\Service;
use App\Models\Lead;
use App\Models\Review;
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
            $q->with('user')->latest();
        }]);

        $data = $service->toArray();

        $data['avg_rating'] = $service->reviews->avg('rating');
        $data['reviews_count'] = $service->reviews->count();

        $data['can_review'] = false;
        $data['has_reviewed'] = false;

        if (Auth::check() && Auth::user()->role === 'user') {
            $userId = Auth::id();

        $hasCompletedLeadWithoutReview = Lead::where('user_id', $userId)
                ->where('service_id', $service->id)
                ->whereHas('leadStatus', fn ($q) => $q->where('name', 'done'))
                ->whereDoesntHave('reviews')
                ->exists();

            $data['can_review'] = $hasCompletedLeadWithoutReview;
            $data['has_reviewed'] = false;
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
