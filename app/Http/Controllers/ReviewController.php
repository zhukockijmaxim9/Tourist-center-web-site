<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Models\Lead;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function index()
    {
        // For admin: show all
        return response()->json(Review::with(['user', 'service'])->latest()->get());
    }

    public function store(StoreReviewRequest $request)
    {
        $validated = $request->validated();
        $userId = Auth::id();
        $serviceId = $validated['service_id'];

        // Verify user has a completed lead for this service
        $hasCompletedLead = Lead::where('user_id', $userId)
            ->where('service_id', $serviceId)
            ->whereHas('leadStatus', fn ($q) => $q->where('name', 'done'))
            ->exists();

        if (!$hasCompletedLead) {
            return response()->json([
                'message' => 'Вы можете оставить отзыв только после выполнения заявки на эту услугу.'
            ], 403);
        }

        // Check if user already reviewed this service
        $alreadyReviewed = Review::where('user_id', $userId)
            ->where('service_id', $serviceId)
            ->exists();

        if ($alreadyReviewed) {
            return response()->json([
                'message' => 'Вы уже оставили отзыв на эту услугу.'
            ], 422);
        }

        $review = Review::create([
            'user_id' => $userId,
            'service_id' => $serviceId,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'is_approved' => false,
        ]);

        return response()->json($review);
    }

    public function approve(Review $review)
    {
        $review->update(['is_approved' => true]);
        return response()->json(['message' => 'Отзыв одобрен']);
    }

    public function destroy(Review $review)
    {
        $review->delete();
        return response()->json(['message' => 'Отзыв удален']);
    }
}
