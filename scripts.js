function validateUsername(username) {
    // Username validation: 3-20 characters, alphanumeric
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function validatePassword(password) {
    // Password validation: at least 8 characters, includes uppercase, lowercase, number
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password);
}

function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');

    // Reset previous error
    if (errorElement) errorElement.textContent = '';

    if (!username) {
        displayError(errorElement, 'Username is required');
        return;
    }

    if (!password) {
        displayError(errorElement, 'Password is required');
        return;
    }

    if (!validateUsername(username)) {
        displayError(errorElement, 'Invalid username format');
        return;
    }

    // Send login request to server
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/home';
        } else {
            displayError(errorElement, 'Invalid username or password');
        }
    })
    .catch(error => {
        displayError(errorElement, 'Login failed. Please try again.');
    });
}

function handleRegister() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const errorElement = document.getElementById('register-error');

    // Reset previous error
    if (errorElement) errorElement.textContent = '';

    if (!username) {
        displayError(errorElement, 'Username is required');
        return;
    }

    if (!password) {
        displayError(errorElement, 'Password is required');
        return;
    }

    if (!validateUsername(username)) {
        displayError(errorElement, 'Username must be 3-20 characters, alphanumeric');
        return;
    }

    if (!validatePassword(password)) {
        displayError(errorElement, 'Password must be at least 8 characters, include uppercase, lowercase, and number');
        return;
    }

    // Send registration request to server
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/login';
        } else {
            return response.text().then(errorMsg => {
                displayError(errorElement, errorMsg || 'Registration failed');
            });
        }
    })
    .catch(error => {
        displayError(errorElement, 'Registration failed. Please try again.');
    });
}

function submitSkill() {
    const skillName = document.getElementById('skill_name').value.trim();
    const experienceYears = document.getElementById('experience_years').value;
    const description = document.getElementById('description').value.trim();
    const contactInfo = document.getElementById('contact_info').value.trim();
    const errorElement = document.getElementById('skill-error');

    // Reset previous error
    if (errorElement) errorElement.textContent = '';

    // Validation
    if (!skillName) {
        displayError(errorElement, 'Skill name is required');
        return;
    }

    if (!experienceYears || parseInt(experienceYears) < 0) {
        displayError(errorElement, 'Valid experience years are required');
        return;
    }

    if (!description) {
        displayError(errorElement, 'Skill description is required');
        return;
    }

    if (!contactInfo) {
        displayError(errorElement, 'Contact information is required');
        return;
    }

    // Send skill upload request
    fetch('/skill_upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `skill_name=${encodeURIComponent(skillName)}&experience_years=${encodeURIComponent(experienceYears)}&description=${encodeURIComponent(description)}&contact_info=${encodeURIComponent(contactInfo)}`
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/home';
        } else {
            return response.text().then(errorMsg => {
                displayError(errorElement, errorMsg || 'Skill upload failed');
            });
        }
    })
    .catch(error => {
        displayError(errorElement, 'Skill upload failed. Please try again.');
    });
}

function displayError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert(message);
    }
}

// Attach event listeners when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form[onsubmit*="handleLogin"]');
    const registerForm = document.querySelector('form[onsubmit*="handleRegister"]');
    const skillForm = document.querySelector('form[onsubmit*="submitSkill"]');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleRegister();
        });
    }

    if (skillForm) {
        skillForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitSkill();
        });
    }
});
