<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::with('category')->orderBy('created_at', 'desc')->get();
        return response()->json($services);
    }

    public function store(StoreServiceRequest $request)
    {
        $validated = $request->validated();

        $service = Service::create($validated);

        return response()->json($service, 201);
    }

    public function show(Service $service)
    {
        return response()->json($service->load(['category', 'reviews' => function($q) {
            $q->where('is_approved', true)->with('user');
        }]));
    }

    public function update(UpdateServiceRequest $request, Service $service)
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
