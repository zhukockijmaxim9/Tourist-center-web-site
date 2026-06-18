<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class StaffMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check() || !auth()->user()->isStaff()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Доступ запрещён'], 403);
            }
            abort(403, 'Доступ запрещён');
        }
        return $next($request);
    }
}
