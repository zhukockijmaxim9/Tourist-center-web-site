<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
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

        $review = Review::create([
            'user_id' => Auth::id(),
            'service_id' => $validated['service_id'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'is_approved' => false, // Always false on creation
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
