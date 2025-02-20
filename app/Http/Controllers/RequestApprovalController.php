<?php

namespace App\Http\Controllers;

use App\Mail\ApproverNotificationMail;
use App\Mail\OwnerNotificationMail;
use App\Models\CreateTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\RequestApprovalModel;
use Illuminate\Support\Facades\DB;

class RequestApprovalController extends Controller
{
    public function store(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'ticket_id' => 'required|integer|exists:hesk_tickets,id',
            'track_id' => 'required|string|max:13',
            'emp_email' => 'nullable|email|max:255',
            'emp_name' => 'nullable|string|max:255',
            'emp_message' => 'nullable|string',
            'staff_message' => 'nullable|string',
            'owner_email' => 'required|email|max:255',
            'owner_name' => 'nullable|string|max:255',
            'approver_email' => 'required|email|max:255',
            'approval_status' => 'nullable|string|max:50',
            'approver_message' => 'nullable|string',
        ]);

        // Insert data into the database
        $changeManagement = RequestApprovalModel::create($validated);

        // Prepare details for emails
        $details = [
            'trackId' => $validated['track_id'],
            'ownerName' => $validated['owner_name'],
            'staffMessage' => $validated['staff_message'],
            'empName' => $validated['emp_name'],
            'empEmail' => $validated['emp_email'],
            'empMessage' => $validated['emp_message'],
            'track_url' => url("/approval-form/{$changeManagement->ticket_id}"),

        ];

        // Send email to owner
        // Mail::to($validated['owner_email'])->send(new OwnerNotificationMail($details));

        // Send email to approver
        Mail::to($validated['approver_email'])->send(new ApproverNotificationMail($details));
        // Return success response
        return response()->json([
            'message' => 'Request approval entry created and emails sent successfully.',
            'data' => $changeManagement,
        ], 201);
    }

    // Fetch a specific change management record
    public function show($ticketId)
    {
        $changeManagement = RequestApprovalModel::where('ticket_id', $ticketId)->first();
        // dd($changeManagement);
        if (!$changeManagement) {
            return response()->json([
                'message' => 'Request approval entry not found.',
            ], 404);
        }
        $matchingTicket = CreateTicket::where('trackid', $changeManagement->track_id)->first();
        if (!$matchingTicket) {
            return response()->json([
                'message' => 'No matching ticket found in the hesk_tickets table.',
            ], 404);
        }
        return response()->json([
            'message' => 'Request approval entry and matching ticket retrieved successfully.',
            'change_management_data' => $changeManagement,
        ], 200);
    }

    // Update a specific change management record
    public function update(Request $request, $ticketId)
    {
        $changeManagement = RequestApprovalModel::where('ticket_id', $ticketId)->first();
        if (!$changeManagement) {
            return response()->json([
                'message' => 'Request approval entry not found.',
            ], 404);
        }
        $matchingTicket = CreateTicket::where('trackid', $changeManagement->track_id)->first();
        if (!$matchingTicket) {
            return response()->json([
                'message' => 'No matching ticket found in the hesk_tickets table.',
            ], 404);
        }
        // Validate the request data
        $validated = $request->validate([
            //'ticket_id' => 'nullable|integer|exists:hesk_tickets,id',
            'approval_status' => 'nullable|string|max:50',
            'approver_message' => 'nullable|string',
        ]);
     
        $changeManagement->update($validated);

        // Prepare details for emails
        $details = [
            'trackId' => $changeManagement['track_id'],
            'approverMessage' => $validated['approver_message'],
            'approvalStatus' => $validated['approval_status'],
            'staffMessage' => $changeManagement['staff_message'],
            'empName' => $changeManagement['emp_name'],
            'empMessage' => $changeManagement['emp_message'],
            'ownerName' => $changeManagement['owner_name'],
            'track_url' => url("/admin/tickets/{$changeManagement->ticket_id}"),

        ];

        // Send email to owner
        Mail::to($changeManagement['owner_email'])->send(new OwnerNotificationMail($details));


        return response()->json([
            'message' => 'Request approval entry updated successfully.',
            'data' => $changeManagement,
        ], 200);
    }
}
