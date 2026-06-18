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
        return response()->json(Review::with(['user', 'service'])->latest()->get());
    }

    public function store(StoreReviewRequest $request)
    {
        $validated = $request->validated();
        $userId = Auth::id();
        $serviceId = $validated['service_id'];
        $leadId = $validated['lead_id'] ?? null;

        if ($leadId) {
            $lead = Lead::where('id', $leadId)
                ->where('user_id', $userId)
                ->where('service_id', $serviceId)
                ->whereHas('leadStatus', fn ($q) => $q->where('name', 'done'))
                ->first();

            if (!$lead) {
                return response()->json([
                    'message' => 'Отзыв можно оставить только по выполненной заявке на эту услугу.'
                ], 403);
            }

            $alreadyReviewedForLead = Review::where('lead_id', $leadId)->exists();

            if ($alreadyReviewedForLead) {
                return response()->json([
                    'message' => 'Вы уже оставили отзыв по этой заявке.'
                ], 422);
            }
        } else {
            $hasCompletedLead = Lead::where('user_id', $userId)
                ->where('service_id', $serviceId)
                ->whereHas('leadStatus', fn ($q) => $q->where('name', 'done'))
                ->exists();

            if (!$hasCompletedLead) {
                return response()->json([
                    'message' => 'Вы можете оставить отзыв только после выполнения заявки на эту услугу.'
                ], 403);
            }
        }

        $review = Review::create([
            'user_id' => $userId,
            'service_id' => $serviceId,
            'lead_id' => $leadId,
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
