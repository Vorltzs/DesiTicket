import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RequestForm from './components/RequestForm';
import Dashboard from './components/Dashboard';
import TicketDetail from './components/TicketDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 text-slate-900 font-sans">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-indigo-200 shadow-lg">
                    D
                  </div>
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                    DesiTicket
                  </span>
                </div>
                <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                  <Link to="/" className="text-slate-600 hover:text-indigo-600 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/request" className="text-slate-600 hover:text-indigo-600 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                    New Request
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/request" element={<RequestForm />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
