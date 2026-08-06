import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster, useToasterStore, toast } from 'react-hot-toast';
import { getReminders as getOpsReminders } from './api/Reminder/opsReminder';
import { updateProfile, getMe } from './api/authApi';

// Components
import Navbar from './components/layout/Navbar';
import GlobalModals from './components/modals/GlobalModals';

// Pages (Lazy Loaded)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const OperationsHome = lazy(() => import('./pages/OperationsSector/OperationsHome'));
const Reminders = lazy(() => import('./pages/OperationsSector/ReminderTracker/Reminders'));
const OperationsReminderDashboard = lazy(() => import('./pages/OperationsSector/ReminderTracker/OperationsReminderDashboard'));
const ExpenseTracker = lazy(() => import('./pages/OperationsSector/ExpenseTracker/ExpenseTrackerMain'));
const AttendanceTracker = lazy(() => import('./pages/OperationsSector/AttendanceTracker/AttendanceTracker'));
const TeamManagement = lazy(() => import('./pages/OperationsSector/Team/TeamManagement'));
const OperationsPayroll = lazy(() => import('./pages/OperationsSector/Payroll/OperationsPayroll'));
const Notes = lazy(() => import('./pages/Notes/Notes'));
const ForgotPassword = lazy(() => import('./pages/Authentication/ForgotPassword'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return children;
};

// Toast Limiter Component
const ToastLimiter = () => {
  const { toasts } = useToasterStore();
  const TOAST_LIMIT = 1;

  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .filter((_, i) => i >= TOAST_LIMIT)
      .forEach((t) => toast.dismiss(t.id));
  }, [toasts]);

  return null;
};

const AppContent = () => {
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [reminders, setReminders] = useState([]);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editData, setEditData] = useState({ username: '', mobile_number: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const fetchInProgress = useRef({ user: false, reminders: false });

  const fetchUserData = async () => {
    if (!token || fetchInProgress.current.user) return;
    fetchInProgress.current.user = true;
    try {
      const res = await getMe();
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (error) {
      console.error("Failed to fetch user data", error);
    } finally {
      fetchInProgress.current.user = false;
    }
  };

  const fetchTodayReminders = async () => {
    if (!token || fetchInProgress.current.reminders) return;
    fetchInProgress.current.reminders = true;
    try {
      const res = await getOpsReminders();
      setReminders(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch reminders for header", error);
    } finally {
      fetchInProgress.current.reminders = false;
    }
  };

  // Effect 1: Fetch user data once when token changes
  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  // Effect 2: Fetch reminders when sector is available
  useEffect(() => {
    if (token) {
      fetchTodayReminders();
      const interval = setInterval(fetchTodayReminders, 60000); // Refresh every minute

      const handleRefresh = () => fetchTodayReminders();
      window.addEventListener('refresh-reminders', handleRefresh);

      return () => {
        clearInterval(interval);
        window.removeEventListener('refresh-reminders', handleRefresh);
      };
    }
  }, [token]);

  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('token');
      const newUser = localStorage.getItem('user');
      setToken(newToken);
      if (newUser) setUser(JSON.parse(newUser));
      if (!newToken) setUser(null);
    };

    const handleRefreshReminders = () => fetchTodayReminders();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('refresh-reminders', handleRefreshReminders);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('refresh-reminders', handleRefreshReminders);
    };
  }, [token]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setToken(null);
    setShowProfileModal(false);
    window.dispatchEvent(new Event('storage'));
    toast.success("Logged out successfully");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append('username', editData.username);
      formData.append('mobile_number', editData.mobile_number || '');
      if (selectedFile) {
        formData.append('profile_image', selectedFile);
      }

      const response = await updateProfile(formData);
      const updatedUser = {
        ...user,
        ...editData,
        profile_image: response.data.profile_image || user.profile_image
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setIsEditingProfile(false);
      setSelectedFile(null);
      setPreviewImage(null);
      toast.success("Profile updated!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Update failed");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const todayReminders = reminders.filter(r => {
    if (location.pathname === '/') return false;
    if (r.is_completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return r.due_date && r.due_date.startsWith(today);
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-x-hidden selection:bg-blue-500/30">
      <ToastLimiter />
      <Toaster position="top-center" reverseOrder={false} />

      <Navbar
        user={user}
        token={token}
        todayReminders={todayReminders}
        onLoginClick={() => setShowLoginModal(true)}
        onSignupClick={() => setShowSignupModal(true)}
        onProfileClick={() => setShowProfileModal(true)}
        onLogout={handleLogout}
      />

      <GlobalModals
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        showSignupModal={showSignupModal}
        setShowSignupModal={setShowSignupModal}
        showProfileModal={showProfileModal}
        setShowProfileModal={setShowProfileModal}
        isEditingProfile={isEditingProfile}
        setIsEditingProfile={setIsEditingProfile}
        editData={editData}
        setEditData={setEditData}
        updatingProfile={updatingProfile}
        handleUpdateProfile={handleUpdateProfile}
        handleFileChange={handleFileChange}
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
        user={user}
        handleLogout={handleLogout}
        setToken={setToken}
        setUser={setUser}
      />

      <main className="pt-[72px] sm:pt-[80px] overflow-x-hidden">
        <Suspense fallback={
          <div className="min-h-[60vh] flex items-center justify-center bg-[#f8fafc]">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={
              token ? (
                <Navigate to="/manufacturing" replace />
              ) : (
                <LandingPage
                  token={token}
                  user={user}
                  onSignupClick={() => setShowSignupModal(true)}
                  onProfileClick={() => setShowProfileModal(true)}
                />
              )
            } />

            {/* Operations Sector Routes */}
            <Route path="/manufacturing" element={<ProtectedRoute><OperationsHome /></ProtectedRoute>} />
            <Route path="/manufacturing/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
            <Route path="/manufacturing/reminder-dashboard" element={<ProtectedRoute><OperationsReminderDashboard /></ProtectedRoute>} />
            <Route path="/manufacturing/expenses" element={<ProtectedRoute><ExpenseTracker /></ProtectedRoute>} />
            <Route path="/manufacturing/attendance" element={<ProtectedRoute><AttendanceTracker /></ProtectedRoute>} />
            <Route path="/manufacturing/team" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
            <Route path="/manufacturing/payroll" element={<ProtectedRoute><OperationsPayroll /></ProtectedRoute>} />

            <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
