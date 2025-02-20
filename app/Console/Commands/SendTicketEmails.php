<?php

// app/Console/Commands/SendTicketEmails.php
namespace App\Console\Commands;

use App\Models\CreateTicket;
use Illuminate\Console\Command;
use App\Models\NotifyTickets;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendTicketEmails extends Command
{
    protected $signature = 'tickets:send-emails';
    protected $description = 'Send emails based on ticket age';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        // Fetch email settings
        $emailSettings = NotifyTickets::first();
    
        // Get unresolved tickets
        $tickets = CreateTicket::whereNull('closedat')
            ->where('status', '!=', 3)
            ->get();
    
        // Group tickets by age range
        $groupedTickets = [
            'tech_team' => [],
            'tech_leader' => [],
            'hr_officer' => [],
        ];
    
        foreach ($tickets as $ticket) {
            $ticketAge = Carbon::parse($ticket->dt)->diffInHours(Carbon::now());
    
            if ($ticketAge >= 12 && $ticketAge < 24) {
                $groupedTickets['tech_team'][] = $ticket;
            } elseif ($ticketAge >= 24 && $ticketAge < 36) {
                $groupedTickets['tech_leader'][] = $ticket;
            } elseif ($ticketAge >= 36) {
                $groupedTickets['hr_officer'][] = $ticket;
            }
        }
    
        // Send grouped emails
        foreach ($groupedTickets as $group => $tickets) {
            if (!empty($tickets)) {
                $emailRecipient = match ($group) {
                    'tech_team' => $emailSettings->tech_team_email,
                    'tech_leader' => $emailSettings->tech_leader_email,
                    'hr_officer' => $emailSettings->hr_officer_email,
                    default => null,
                };
    
                if ($emailRecipient) {
                    Mail::send('emails.ticket_notification', ['tickets' => $tickets], function ($message) use ($emailRecipient, $group) {
                        $message->to($emailRecipient)
                            ->subject("Unresolved Tickets - {$group}");
                    });
                }
            }
        }
    
        $this->info('Ticket reminder emails sent successfully!');
    }
    
}
