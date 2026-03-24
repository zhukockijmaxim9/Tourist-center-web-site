<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'email',
        'phone',
        'message',
        'service_id',
        'status',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
