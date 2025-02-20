<?php

namespace App\Http\Controllers;

use App\Models\AssetDetails;
use App\Models\CreateTicket;
use App\Models\HeskReply;
use Exception;
use Illuminate\Http\Request;

class ViewTicketController extends Controller
{
    /**
     * Fetch ticket details based on trackid and email.
     */
    public function show(Request $request)
    {
        $validatedData = $request->validate([
            'trackid' => 'required|string', 
            'email' => 'required|email',   
        ]);

        // Fetch the ticket based on trackid and email
        $ticket = CreateTicket::where('trackid', $validatedData['trackid'])
            ->where('email', $validatedData['email'])
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'No ticket found with the provided track ID and email.',
            ], 404);
        }
        // Fetch replies related to the ticket using the model
        $replies = HeskReply::where('replyto', $ticket->id)->get(['id', 'name', 'message', 'message_html', 'dt', 'attachments', 'staffid', 'read', 'rating']);
        $bearerToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMzAxOTJiNDA5Mjg0MzBjNmNlODQwYmQzNGM3ZTNhMjk4MzYxNGUyMWM4NzI3YWZmNzIxN2UzNGQ2OWMyNTM2MTdiMzQ2ZmVhNjUwYjFhY2UiLCJpYXQiOjE3MjgzNzgzMzEuMDQ4OTksIm5iZiI6MTcyODM3ODMzMS4wNDg5OTIsImV4cCI6MjIwMTY3NzUzMS4wMzY5NzIsInN1YiI6IjMiLCJzY29wZXMiOltdfQ.mgBlg89lZ2o7tfpFie2nYEF53Kra3t4VW7txwBvPKnc7iFv8a-q3EAvU9RwUt2FlHG3ydnG6vc_seygjgIZIjuhueX9AvShOJiFbYOr12GwgNbLip_nWeOo3giqPlj1bqKpBAyIoE3vOl-bNfZ9yXj6VFp_4tjdV-HDHR17UTsKBgzne2-epru9G_gmrwnIwxI0NBNbcBAkNwitVjwOdfpoCcaN9iKmOKHOcBCyX8qqbLaseeiAMDXP-_JGBD1oTlt9ehLK1CpNaUVMhpFqxMt4S3TTxmDJVu7jb1PLmETbBnT8ro6VOQoJk8JsCN5ntKjYocgxjBYF-06yxd36_1OydpUxDobi6nvDlZxc0h9GjsNEuzZIyef-3VZ54CA9mF2xfXj4Z-HlCT_BQk-XAa1Nu8q--MVvz9FhVoS5AchD5ksRReAzyh8XDTNZM1QVGp2mShs1NH0Dq_TVZ_28y1uowBOAiO609YDAqP6PB1LrgBZB0HFyikC0-K00Ri7-930WAIyAVYSSavU00_19oMZvbHCXWHSvf1x7CTJk5MD-G0ICp851FP2gykIGRbiW18wr0RjxcrMUrbkGRAFY7aaM_kjjQSgV-Hjj6TBVVClYMWZuredC5Y_I5WSw8aC097Nbf8kaVQct5wE-aX7ZTOCGNeAZNRf0EuOtRyv1VMYg';
        $assets = [];
        // Fetch user by email
        try {
            $user = AssetDetails::getUserByEmail($ticket->email, $bearerToken);
            $assets = AssetDetails::getAssetsByUserId($user['id'], $bearerToken);
        } catch (Exception $e) {
            $assets = null;
        }

        return response()->json([
            'success' => true,
            'data' => $ticket,
            'replies' => $replies,
            'assets' => $assets,
        ]);
    }

    /**
     * Update ticket details based on trackid and email passed as URL parameters.
     */
    public function update(Request $request, $trackid, $email)
    {
        // Fetch the ticket to update based on trackid and email
        $ticket = CreateTicket::where('trackid', $trackid)
            ->where('email', $email)
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'No ticket found with the provided track ID and email.',
            ], 404);
        }

        // Validate incoming request
        $validatedData = $request->validate([
            'message' => 'nullable|string', 
        ]);

        // Extract and unset 'message' to prevent it from updating the ticket
        $ticketUpdateData = $validatedData;
        unset($ticketUpdateData['message']);

        // Update other ticket fields, excluding 'message'
        if (!empty($ticketUpdateData)) {
            $ticket->update($ticketUpdateData);
        }

        // Add a new entry to the hesk_replies table if a message is provided
        if (isset($validatedData['message']) && $validatedData['message'] !== '') {
            $attachmentDetails = []; 

            HeskReply::create([
                'replyto' => $ticket->id,
                'name' => $ticket->name, 
                'message' => $validatedData['message'],
                'message_html' => nl2br(e($validatedData['message'])),
                'dt' => now(),
                'attachments' => implode(',', $attachmentDetails), 
                'staffid' => 0, 
                'rating' => null,
                'read' => '0',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ticket updated successfully.',
            'data' => $ticket,
        ]);
    }
}
