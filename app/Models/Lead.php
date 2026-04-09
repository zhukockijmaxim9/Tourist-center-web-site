<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Lead extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'message',
        'service_id',
        'user_id',
        'lead_status_id',
        'status',
        'assigned_to_user_id',
        'assigned_by_user_id',
        'assigned_at',
        'locked_by_user_id',
        'locked_at',
        'lock_expires_at',
        'confirmed_at',
    ];

    protected $appends = [
        'status',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'locked_at' => 'datetime',
        'lock_expires_at' => 'datetime',
        'confirmed_at' => 'datetime',
    ];

    public function leadStatus()
    {
        return $this->belongsTo(LeadStatus::class);
    }

    public function notes()
    {
        return $this->hasMany(LeadNote::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by_user_id');
    }

    public function lockedBy()
    {
        return $this->belongsTo(User::class, 'locked_by_user_id');
    }

    public function getStatusAttribute(): ?string
    {
        return $this->leadStatus?->name;
    }

    public function setStatusAttribute(?string $value): void
    {
        if ($value === null || $value === '') {
            return;
        }

        $statusId = LeadStatus::query()->where('name', $value)->value('id');
        if ($statusId) {
            $this->attributes['lead_status_id'] = $statusId;
        }
    }

    public function isLockActive(): bool
    {
        if (!$this->locked_by_user_id) return false;
        if (!$this->lock_expires_at) return false;

        return Carbon::now()->lt($this->lock_expires_at);
    }
}
