<!DOCTYPE html>
<html>
<head>
    <title>Approval Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h3 {
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        table th {
            background-color: #f4f4f4;
            font-weight: bold;
        }
        table td {
            background-color: #ffffff;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 14px;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #555;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <h3>Hello {{ $details['ownerName'] }},</h3>
        <p>
    The approval request has been 
    <span style="color: {{ $details['approvalStatus'] === 'Approved' ? 'green' : ($details['approvalStatus'] === 'Rejected' ? 'red' : 'black') }};">
        {{ $details['approvalStatus'] }}
    </span>.
</p>
        <table>
            <tr>
                <th>Track ID</th>
                <td>{{ $details['trackId'] }}</td>
            </tr>
            <tr>
                <th>Approver Message</th>
                <td>{{ $details['approverMessage'] }}</td>
            </tr>
            <!-- <tr>
                <th>Approval Status</th>
                <td>{{ $details['approvalStatus'] }}</td>
            </tr> -->
            <tr>
                <th>Requesting For</th>
                <td>{{ $details['staffMessage'] }}</td>
            </tr>
            <tr>
                <th>Employee Name</th>
                <td>{{ $details['empName'] }}</td>
            </tr>
            <tr>
                <th>Employee Message</th>
                <td>{{ $details['empMessage'] }}</td>
            </tr>
        </table>
        <p>Please review the request and respond at your earliest convenience.</p>
        <p><a href="{{ $details['track_url'] }}" class="button">Click here to view the Request</a></p>
        <p class="footer">Regards,<br>Fidelis Team</p>
    </div>
</body>
</html>
