// Auth Logic
const Auth = {
    async login(password) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await response.json();
            if (data.success) {
                window.location.href = '/dashboard.html';
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            alert(error.message);
        }
    },

    checkAuth() {
        // Simple check if token exists in cookies
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (!token && window.location.pathname === '/dashboard.html') {
            window.location.href = '/login.html';
        } else if (token && window.location.pathname === '/login.html') {
            window.location.href = '/dashboard.html';
        }
    },

    logout() {
        document.cookie = "token=; Max-Age=0; path=/;";
        window.location.href = '/login.html';
    }
};

// Auto check auth on load
Auth.checkAuth();
