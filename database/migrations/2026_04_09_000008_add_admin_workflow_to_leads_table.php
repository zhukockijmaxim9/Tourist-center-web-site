<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->foreignId('assigned_to_user_id')->nullable()->after('lead_status_id')->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_by_user_id')->nullable()->after('assigned_to_user_id')->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable()->after('assigned_by_user_id');

            $table->foreignId('locked_by_user_id')->nullable()->after('assigned_at')->constrained('users')->nullOnDelete();
            $table->timestamp('locked_at')->nullable()->after('locked_by_user_id');
            $table->timestamp('lock_expires_at')->nullable()->after('locked_at');

            $table->timestamp('confirmed_at')->nullable()->after('lock_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropConstrainedForeignId('assigned_to_user_id');
            $table->dropConstrainedForeignId('assigned_by_user_id');
            $table->dropConstrainedForeignId('locked_by_user_id');
            $table->dropColumn([
                'assigned_at',
                'locked_at',
                'lock_expires_at',
                'confirmed_at',
            ]);
        });
    }
};

