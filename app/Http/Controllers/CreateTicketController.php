<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateTicketRequest;
use App\Mail\TicketCreatedMail;
use App\Models\CreateTicket as ModelsCreateTicket;
use App\Models\EmailList;
use App\Models\HeskAttachment;
use App\Models\HeskReply;
use App\Models\HeskUser;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class CreateTicketController extends Controller
{

    //Function to create end user ticket
    public function createTicket(CreateTicketRequest $request)
    {
        $validatedData = $request->validated();
        $emailRecord = EmailList::where('email', $validatedData['email'])->first();
        if (!$emailRecord) {
            return response()->json([
                'success' => false,
                'message' => 'The email is not in the allowed list. Ticket creation denied.',
            ], 403);
        }

        if ($emailRecord->lock) {
            return response()->json([
                'success' => false,
                'message' => 'The email is locked. Ticket creation denied.',
            ], 403);
        }

        $trackid = $this->generateUniqueTrackID();
        $validatedData['trackid'] = $trackid;
        $assignedUser = HeskUser::where('isadmin', '0')->inRandomOrder()->first();
        if (!$assignedUser) {
            return response()->json([
                'success' => false,
                'message' => 'No users available to assign the ticket.',
            ], 500);
        }
        $validatedData['owner'] = $assignedUser->id;
        $attachmentDetails = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                try {
                    if (!$file->isValid()) {
                        return response()->json([
                            'success' => false,
                            'message' => "File upload failed for {$file->getClientOriginalName()}",
                        ], 400);
                    }

                    $fileSize = $file->getSize();
                    if ($fileSize > 10 * 1024 * 1024) {
                        return response()->json([
                            'success' => false,
                            'message' => "Attachment {$file->getClientOriginalName()} exceeds the size limit of 10MB.",
                        ], 400);
                    }

                    $savedName = $trackid . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $attachmentPath = public_path('attachments');
                    if (!file_exists($attachmentPath)) {
                        mkdir($attachmentPath, 0777, true);
                    }

                    if ($file->move($attachmentPath, $savedName)) {
                        $attachmentRecord = HeskAttachment::create([
                            'ticket_id' => $trackid,
                            'saved_name' => $savedName,
                            'real_name' => $file->getClientOriginalName(),
                            'size' => $fileSize,
                            'type' => '0',
                        ]);
                        $attachmentDetails[] = $savedName;
                    } else {
                        return response()->json([
                            'success' => false,
                            'message' => "Failed to save file {$file->getClientOriginalName()}",
                        ], 500);
                    }
                } catch (\Exception $e) {
                    return response()->json([
                        'success' => false,
                        'message' => "Error processing file {$file->getClientOriginalName()}: " . $e->getMessage(),
                    ], 500);
                }
            }
        }

        $validatedData['attachments'] = implode(',', $attachmentDetails);

        $priority = (int)$validatedData['priority'];
        $dueDate = match ($priority) {
            0 => now()->addDay(),
            1 => now()->addHours(10.5),
            2 => now()->addHours(9.5),
            default => null,
        };
        $validatedData['due_date'] = $dueDate;
        $ticket = ModelsCreateTicket::create($validatedData);

        HeskReply::create([
            'replyto' => $ticket->id,
            'name' => $validatedData['name'],
            'message' => $validatedData['message'],
            'message_html' => nl2br(e($validatedData['message'])),
            'dt' => now(),
            'attachments' => implode(',', $attachmentDetails),
            'staffid' => 0,
            'rating' => null,
            'read' => '0',
        ]);
        // $emplyeeDetails = [
        //     'name' => $validatedData['name'],
        //     'track_id' => $ticket->trackid,
        //     'track_url' => url("/view-ticket"),
        //     'site_title' => config('app.name'),
        //     'site_url' => config('app.url'),
        // ];

        // try {
        //     Mail::to($validatedData['email'])->send(new TicketCreatedMail($emplyeeDetails));
        // } catch (\Exception $e) {
        //     \Log::error('Failed to send ticket creation email to employee: ' . $e->getMessage());
        // }

        // $ticketDetails = [
        //     'name' => $validatedData['name'],
        //     'message' => $ticket->message,
        //     'track_id' => $ticket->trackid,
        //     'track_url' => url("/admin/tickets/{$ticket->id}"),
        //     'site_title' => config('app.name'),
        //     'site_url' => config('app.url'),
        // ];

        // $ticketDetails['recipient'] = $assignedUser->name;
        // $ticketDetails['role'] = 'Assigned User';

        // try {
        //     Mail::to($assignedUser->email)->send(new TicketCreatedMail($ticketDetails));
        // } catch (\Exception $e) {
        //     \Log::error('Failed to send ticket assignment email to assigned user: ' . $e->getMessage());
        // }
        return response()->json([
            'success' => true,
            'message' => 'Ticket created successfully and assigned to a user!',
            'data' => $ticket,
            'assigned_user' => $assignedUser->name,
            'attachments' => $attachmentDetails,
        ], 201);
    }


    /**
     * Generate a unique track ID.
     *
     * @return string
     */
    private function generateUniqueTrackID()
    {
        $parts = [];
        for ($i = 0; $i < 3; $i++) {
            $parts[] = Str::upper(Str::random(3));
        }
        return implode('-', $parts);
    }
}
