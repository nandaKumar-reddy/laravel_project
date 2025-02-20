<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestApprovalModel extends Model
{
    use HasFactory;

    protected $table = 'hesk_change_management';

    protected $fillable = [
        'track_id',
        'ticket_id',
        'emp_email',
        'emp_name',
        'emp_message',
        'staff_message',
        'owner_email',
        'owner_name',
        'approver_email',
        'approval_status',
        'approver_message',
    ];
}
