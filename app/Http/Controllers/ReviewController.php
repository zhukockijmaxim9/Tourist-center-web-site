<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function index()
    {
        // For admin: show all
        return response()->json(Review::with(['user', 'service'])->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'service_id' => 'required|exists:services,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review = Review::create([
            'user_id' => Auth::id(),
            'service_id' => $request->service_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
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
