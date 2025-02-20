import '../css/app.css';
import './bootstrap';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Frontend/Home';  // Import your Home component
import ViewTicketForm from './Pages/Frontend/ViewTicketForm';
import TicketDetails from './Pages/Frontend/TicketDetails';
import CreateTicket from './Pages/Frontend/CreateTicket';
import TicketSubmitted from './Pages/Frontend/TicketSubmitted';
import AdminDashboard from './Pages/Dashboard/AdminDashboard';
import Login from './Pages/Dashboard/Login';
import AdminEmailList from './Pages/Dashboard/AdminEmailList';
import Profile from './Pages/Dashboard/AdminCategories';
import Users from './Pages/Dashboard/Users';
import AdminTickets from './Pages/Dashboard/AdminTickets';
import RequestTickets from './Pages/Dashboard/RequestTickets';
import IncidentTickets from './Pages/Dashboard/IncidentTickets';
import SmtpConfig from './Pages/Dashboard/SmtpConfig';
import DbConfig from './Pages/Dashboard/DbConfig';
import NotificationConfig from './Pages/Dashboard/NotificationConfig';
import ExportTickets from './Pages/Dashboard/ExportTickets';
import AdminTicketDetails from './Pages/Dashboard/AdminTicketDetails';
import AdminProfile from './Pages/Dashboard/AdminProfile';
import AdminNotice from './Pages/Dashboard/AdminNotice';
import ApprovalForm from './Pages/Frontend/ApprovalForm';
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
import { register as registerServiceWorker } from "./serviceWorker";
import ResolvedTickets from './Pages/Dashboard/ResolvedTickets';
import OverdueTickets from './Pages/Dashboard/OverdueTickets';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/view-ticket" element={<ViewTicketForm />} />
        <Route path="/approval-form/:id" element={<ApprovalForm />} />
        <Route path="/ticket-details" element={<TicketDetails />} />
        <Route path="/create-ticket" element={<CreateTicket />} />
        <Route path="/ticket-submitted" element={<TicketSubmitted />} />
        <Route path="/admin" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<Profile />} />
        <Route path="/admin/emails" element={<AdminEmailList />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        <Route path="/admin/tickets/:id" element={<AdminTicketDetails />} />
        <Route path="/admin/request-tickets" element={<RequestTickets />} />
        <Route path="/admin/incident-tickets" element={<IncidentTickets />} />
        <Route path="/admin/smtp-config" element={<SmtpConfig />} />
        <Route path="/admin/db-config" element={<DbConfig />} />
        <Route path="/admin/notify-email" element={<NotificationConfig />} />
        <Route path="/admin/export-tickets" element={<ExportTickets />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/notice" element={<AdminNotice />} />
        <Route path="/admin/resolved-tickets" element={<ResolvedTickets />} />
        <Route path="/admin/overdue-tickets" element={<OverdueTickets />} />
      </Routes>
    </Router>
  );
}


// Render the App component to the DOM
const root = createRoot(document.getElementById('app'));
root.render(<App />);
// Register the service worker
registerServiceWorker();