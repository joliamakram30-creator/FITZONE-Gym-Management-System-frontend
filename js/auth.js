/**
 * FITZONE - Authentication and Session Management
 * Simulated role-based access for Admin and Client workflows
 */

const SESSION_KEY = 'fitzone_session_user';

const Auth = {
  // Get current logged-in user session
  getCurrentUser() {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (!sessionStr) return null;
      return JSON.parse(sessionStr);
    } catch (e) {
      return null;
    }
  },

  // Set session
  setSession(user) {
    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'client',
      memberId: user.memberId || null,
      avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return sessionData;
  },

  // Perform login
  login(email, password) {
    if (!email || !password) {
      return { success: false, message: "Please provide both email and password." };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const users = DB.get('users');
    const matched = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!matched) {
      return { success: false, message: "No account found with this email address." };
    }

    if (matched.password !== password) {
      return { success: false, message: "Incorrect password. Please try again." };
    }

    // Success
    const session = this.setSession(matched);
    return { success: true, user: session };
  },

  // Register new client member
  register(formData) {
    const { name, email, phone, password, confirmPassword } = formData;

    if (!name || !email || !phone || !password) {
      return { success: false, message: "All fields are required." };
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Passwords do not match." };
    }

    if (password.length < 6) {
      return { success: false, message: "Password must be at least 6 characters." };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const users = DB.get('users');
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, message: "An account with this email already exists." };
    }

    // 1. Generate member ID
    const memberId = DB.generateNextMemberId();
    const today = new Date().toISOString().split('T')[0];
    const expDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 2. Create Member Record in database
    const newMember = {
      id: memberId,
      name: name.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      gender: "Not specified",
      dob: "2000-01-01",
      address: "Cairo, Egypt",
      photo: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1507003211169-0a1dd7228f2d' : '1494790108377-be9c29b29330'}?w=300&auto=format&fit=crop&q=80`,
      registrationDate: today,
      planId: "plan-1",
      planName: "Basic Fitness",
      startDate: today,
      expireDate: expDate,
      status: "Active",
      assignedTrainerId: null,
      assignedTrainerName: "None",
      workoutPlanId: "wp-4",
      workoutPlanName: "Beginner Total Body Conditioning",
      measurements: [
        { date: today, weight: 70, height: 172, chest: 95, waist: 80, arms: 32, bodyFat: 20 }
      ]
    };

    DB.add('members', newMember);

    // 3. Create User Account
    const newUser = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: trimmedEmail,
      password: password,
      role: "client",
      memberId: memberId,
      avatar: newMember.photo,
      createdAt: today
    };

    DB.add('users', newUser);

    // 4. Create welcome notification
    DB.add('notifications', {
      type: 'registration',
      title: 'New Member Registered',
      message: `${name} has registered a new online account (${memberId}).`,
      time: new Date().toISOString().replace('T', ' ').slice(0, 16),
      read: false,
      badge: 'New Member',
      link: 'members.html'
    });

    const session = this.setSession(newUser);
    return { success: true, user: session };
  },

  // Logout
  logout() {
    localStorage.removeItem(SESSION_KEY);
    // Determine path to login
    const isInsideSubdir = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/client/');
    const redirectUrl = isInsideSubdir ? '../login.html' : 'login.html';
    window.location.href = redirectUrl;
  },

  // Fast demo switcher for convenience
  quickLogin(role) {
    if (role === 'admin') {
      return this.login('admin@fitzone.com', 'admin123');
    } else {
      return this.login('member@fitzone.com', 'member123');
    }
  },

  // Route security guard
  guard(allowedRoles = []) {
    const user = this.getCurrentUser();
    const isInsideAdmin = window.location.pathname.includes('/admin/');
    const isInsideClient = window.location.pathname.includes('/client/');

    if (!user) {
      // Not logged in
      const loginPath = (isInsideAdmin || isInsideClient) ? '../login.html' : 'login.html';
      window.location.href = `${loginPath}?redirect=${encodeURIComponent(window.location.pathname)}`;
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      if (user.role === 'client' && isInsideAdmin) {
        alert("Access Denied: Admin privileges required. Redirecting to your member portal.");
        window.location.href = '../client/my-dashboard.html';
        return false;
      }
    }

    return true;
  }
};
