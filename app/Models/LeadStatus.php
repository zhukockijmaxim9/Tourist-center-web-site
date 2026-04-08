<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadStatus extends Model
{
    protected $fillable = [
        'name',
        'label',
        'color',
        'sort_order',
        'is_final',
    ];

    protected $casts = [
        'is_final' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }
}
