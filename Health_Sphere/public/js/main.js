// Firebase Configuration (Updated v7)
// REPLACE THESE VALUES WITH YOUR OWN FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyD6CLQP5l29zSEx0s5Dv7YXAQq7fVGcINE",
  authDomain: "healthspherelj.firebaseapp.com",
  projectId: "healthspherelj",
  storageBucket: "healthspherelj.firebasestorage.app",
  messagingSenderId: "356894216134",
  appId: "1:356894216134:web:9434b144bf0ee73703acc7",
  measurementId: "G-L0FZJ2YD6W"
};

// --- UI Utility Functions (Modals & Toasts) ---

/**
 * Show a non-blocking toast notification
 * @param {string} message 
 * @param {string} type 'success', 'danger', 'warning', 'info'
 */
function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toastId = 'toast-' + Date.now();
    const icon = type === 'success' ? 'bi-check-circle-fill' : 
                 type === 'danger' ? 'bi-exclamation-octagon-fill' : 
                 type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';
    
    const colorClass = type === 'success' ? 'text-success' : 
                       type === 'danger' ? 'text-danger' : 
                       type === 'warning' ? 'text-warning' : 'text-primary';

    const html = `
        <div id="${toastId}" class="toast align-items-center mb-3" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center">
                    <i class="bi ${icon} ${colorClass} fs-4 me-2"></i>
                    <div>${message}</div>
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', html);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();
    
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

/**
 * Show a blocking modal message (Replacement for alert)
 * @param {string} title 
 * @param {string} message 
 */
function showModal(title, message) {
    const modalTitle = document.getElementById('infoModalTitle');
    const modalBody = document.getElementById('infoModalBody');
    
    // Create modal if it doesn't exist dynamic checking would be better but simple assumption for now
    // We will assume genericModal exists in index.html, if not we create it here dynamically
    if (!document.getElementById('genericModal')) {
        createGenericModal();
    }
    
    document.getElementById('genericModalTitle').textContent = title;
    document.getElementById('genericModalBody').innerHTML = message;
    
    const modal = new bootstrap.Modal(document.getElementById('genericModal'));
    modal.show();
}

/**
 * Show a confirmation modal (Replacement for confirm)
 * @param {string} title 
 * @param {string} message 
 * @param {Function} onConfirm 
 */
function showConfirm(title, message, onConfirm) {
    if (!document.getElementById('confirmationModal')) {
        // Fallback if modal removed from HTML, mostly shouldn't happen based on index.html
        alert('Confirmation Modal Missing'); 
        if(confirm(message)) onConfirm();
        return;
    }
    
    document.getElementById('confirmationModalTitle').textContent = title;
    document.getElementById('confirmationModalBody').textContent = message;
    
    const confirmBtn = document.getElementById('confirmationModalConfirmBtn');
    
    // Remove old listeners to prevent stacking
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
    
    newBtn.addEventListener('click', () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
        modal.hide();
        if (onConfirm) onConfirm();
    });
    
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();
}

/**
 * Show an input modal (Replacement for prompt)
 * @param {string} title 
 * @param {string} label 
 * @param {Function} onSubmit (value) => void
 * @param {string} defaultValue
 */
function showInputModal(title, label, onSubmit, defaultValue = '') {
    // Check if input modal exists, if not create
    if (!document.getElementById('inputModal')) {
        createInputModal();
    }
    
    document.getElementById('inputModalTitle').textContent = title;
    document.getElementById('inputModalLabel').textContent = label;
    const input = document.getElementById('inputModalInput');
    input.value = defaultValue;
    
    const submitBtn = document.getElementById('inputModalSubmitBtn');
    const newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);
    
    newBtn.addEventListener('click', () => {
        const val = input.value;
        if (!val) {
            showToast('Please enter a value', 'warning');
            return;
        }
        const modal = bootstrap.Modal.getInstance(document.getElementById('inputModal'));
        modal.hide();
        if (onSubmit) onSubmit(val);
    });
    
    const modal = new bootstrap.Modal(document.getElementById('inputModal'));
    modal.show();
}

// Helper to inject modals if missing
function createGenericModal() {
    const html = `
    <div class="modal fade" id="genericModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold" id="genericModalTitle">Alert</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4" id="genericModalBody"></div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-primary rounded-pill px-4" data-bs-dismiss="modal">OK</button>
          </div>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}

function createInputModal() {
    const html = `
    <div class="modal fade" id="inputModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold" id="inputModalTitle">Input</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <label class="form-label text-muted small" id="inputModalLabel">Value</label>
            <input type="text" class="form-control" id="inputModalInput">
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary rounded-pill" id="inputModalSubmitBtn">Submit</button>
          </div>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}


// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
// Storage removed as requested

let allAppointments = []; // Store appointments globally for filtering
let currentUser = null;

// Initialize on Load
document.addEventListener("DOMContentLoaded", () => {
    // Load Doctors immediately for the booking form
    if (typeof populateDoctorDropdown === "function") {
        populateDoctorDropdown();
    }

  // Listen for auth state changes
  // Listen for auth state changes
  let userUnsubscribe = null;

  auth.onAuthStateChanged((user) => {
    if (userUnsubscribe) {
        userUnsubscribe();
        userUnsubscribe = null;
    }

    if (user) {
      // 1. Set Basic User Data Immediately (Prevent Lockout)
      currentUser = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email.split("@")[0],
          role: 'patient', // Default until loaded
          providerData: user.providerData
      };
      
      // Update UI immediately (so they are "Logged In")
      updateAuthUI();

      // 2. Real-time listener for User Profile (Role, Phone, Specialization)
      userUnsubscribe = db.collection("users")
        .doc(user.uid)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data();
            // Merge data securely
            currentUser = { 
                ...currentUser, 
                ...data,
                uid: user.uid, // Enforce UID validity
                providerData: user.providerData // Keep provider data
            };

            console.log("User profile loaded/updated:", currentUser);
            updateAuthUI();
            
            // Reload feedbacks to update "Verify" buttons based on new role
            if (document.getElementById('feedbackList')) {
                loadFeedbacks();
            }

            // --- BAN CHECK ---
            if (currentUser.isBanned) {
                auth.signOut().then(() => {
                    localStorage.setItem('healthSphere_banned_msg', 'true');
                    window.location.href = 'index.html';
                });
                return;
            }

            // Redirects (Only if role is confirmed)
            const path = window.location.pathname;
             if (path.includes('dashboard.html') && currentUser.role !== 'doctor') {
                 window.location.href = 'index.html';
             } else if (path.includes('admin.html') && currentUser.role !== 'admin') {
                 window.location.href = 'index.html';
             }
             
             if (path.includes('dashboard.html')) {
                  loadAppointments();
             } else if (path.includes('admin.html')) {
                 loadAdminData();
             }
             
             // Check Specialization (for Doctors)
             if (currentUser.role === 'doctor') {
                 checkDoctorSpecialization();
             }

          } else {
               console.log("User authenticated, waiting for profile creation...");
               // Do NOT log out. Access is just limited to 'patient' default.
          }
        }, (error) => {
            console.error("Error fetching user profile:", error);
        });

    } else {
      currentUser = null;
      updateAuthUI();
      // detailed check for dashboard redirection
      if (window.location.pathname.includes("dashboard.html") || window.location.pathname.includes("admin.html")) {
        window.location.href = "index.html";
      }
    }
  });
});

// Update UI based on Auth State
function updateAuthUI() {
  const authButtons = document.getElementById("authButtons");
  const userProfile = document.getElementById("userProfile");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const heroAuthButtons = document.getElementById("hero-auth-buttons");
  
  // Dashboards
  const patientDashboard = document.getElementById("patient-dashboard");
  const doctorDashboard = document.getElementById("doctor-dashboard");
  const adminDashboard = document.getElementById("admin-dashboard");

  // Navbar Links
  const doctorLink = document.getElementById("doctorLink");
  const adminLink = document.getElementById("adminLink");

  if (currentUser) {
    // Logged In
    if (authButtons) authButtons.classList.add("d-none");
    if (userProfile) {
      userProfile.classList.remove("d-none");
      if (userNameDisplay) userNameDisplay.textContent = currentUser.name || 'User';
      
      // Update Email Display
      const userEmailDisplay = document.getElementById("userEmail");
      if (userEmailDisplay) userEmailDisplay.textContent = currentUser.email || '';

      // Update Avatar Initial
      const userAvatarText = document.getElementById("userAvatarText");
      if (userAvatarText) {
          const name = currentUser.name || 'U';
          userAvatarText.textContent = name.charAt(0).toUpperCase();
      }
    }
    if (heroAuthButtons) heroAuthButtons.classList.add("d-none");

    // Hide all dashboards first
    document.querySelectorAll('.dashboard-view').forEach(el => el.classList.add('d-none'));

    // Show specific dashboard based on role & Load Data
    if (currentUser.role === 'doctor') {
        if(doctorDashboard) doctorDashboard.classList.remove('d-none');
        loadDoctorEmbeddedSchedule();
        checkDoctorSpecialization(); // Check profile completion
        loadLeaveDates(); // Load leave dates
        
        // Check if on Standalone Dashboard
        if (document.getElementById("appointmentsTableBody")) {
            loadAppointments();
        }
    } else if (currentUser.role === 'admin') {
        if(adminDashboard) adminDashboard.classList.remove('d-none');
        loadAdminData();
    } else {
        // Default to Patient
        if(patientDashboard) patientDashboard.classList.remove('d-none');
        loadPatientAppointments();
    }

    // Role-based Navbar Links
    if (doctorLink) doctorLink.classList.toggle("d-none", currentUser.role !== 'doctor');
    if (adminLink) adminLink.classList.toggle("d-none", currentUser.role !== 'admin');

    // Populate Settings Modal
    const settingsName = document.getElementById('settingsName');
    const settingsEmail = document.getElementById('settingsEmail');
    const settingsPhone = document.getElementById('settingsPhone');
    const phoneStatus = document.getElementById('phoneVerifiedStatus');
    
    if (settingsName) settingsName.value = currentUser.name || '';
    if (settingsEmail) settingsEmail.value = currentUser.email || '';
    if (settingsPhone) settingsPhone.value = currentUser.phone || '';
    
    // Check if phone number is verified (Firebase doesn't have a direct 'phoneVerified' prop on user object in client SDK easily accessible without provider data check, 
    // Logout Function
window.logout = function() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error("Logout Error:", error);
    });
};
    // Check if phone number is verified
    // Safety check for providerData
    const isPhoneVerified = (currentUser.providerData || []).some(p => p.providerId === 'phone');
    if (phoneStatus) {
        if (isPhoneVerified) {
            phoneStatus.innerHTML = '<span class="text-success"><i class="bi bi-check-circle-fill"></i> Verified</span>';
            document.getElementById('verifyPhoneBtn').disabled = true;
        } else {
            phoneStatus.innerHTML = '<span class="text-warning"><i class="bi bi-exclamation-circle-fill"></i> Unverified</span>';
            document.getElementById('verifyPhoneBtn').disabled = false;
        }
    }

    // Check for existing feedback (index.html)
    checkExistingFeedback();

  } else {
    // Logged Out
    if (authButtons) authButtons.classList.remove("d-none");
    if (userProfile) userProfile.classList.add("d-none");
    if (heroAuthButtons) heroAuthButtons.classList.remove("d-none");
    
    // Hide all dashboards
    document.querySelectorAll('.dashboard-view').forEach(el => el.classList.add('d-none'));

    if (doctorLink) doctorLink.classList.add("d-none");
    if (adminLink) adminLink.classList.add("d-none");
  }
}

// --- Real-world Email Domain Validation ---
async function verifyEmailDomain(email) {
    // Fail-safe: If anything goes wrong, allow the email.
    try {
        const domain = email.split('@')[1];
        if (!domain) return false;

        // 2-second timeout barrier
        const timeout = new Promise(resolve => setTimeout(() => resolve('TIMEOUT'), 2000));
        
        // DNS Lookup
        const lookup = fetch(`https://dns.google/resolve?name=${domain}&type=MX`)
            .then(res => {
                if (!res.ok) throw new Error('API Error');
                return res.json();
            })
            .catch(() => 'ERROR');

        // Race them
        const result = await Promise.race([lookup, timeout]);

        if (result === 'TIMEOUT' || result === 'ERROR') {
            console.warn("DNS check skipped (timeout/error)");
            return true; // Allow it
        }

        // If we got a valid response, check it
        if (result.Status === 0 && result.Answer && result.Answer.length > 0) {
            return true;
        }
        
        // Explicitly invalid domain (Status NXDOMAIN etc)
        return false; 

    } catch (e) {
        console.error("Critical Domain Check Error:", e);
        return true; // Always allow on crash
    }
}

// Forgot Password Trigger
window.forgotPassword = function() {
    // Hide Login Modal if open
    const loginModalEl = document.getElementById('loginModal');
    if (loginModalEl) {
        bootstrap.Modal.getInstance(loginModalEl).hide();
    }
    
    // Show Forgot Password Modal
    const myModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    myModal.show();
};

// Handle Forgot Password Form Submission
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        const btn = forgotPasswordForm.querySelector('button[type="submit"]');
        
        // Disable button to prevent multiple clicks
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Checking...";

        // 0. Validate Domain Exists
        verifyEmailDomain(email).then(isValid => {
            if (!isValid) {
                throw new Error("This email domain does not exist.");
            }
            // 1. Check if user exists in Firestore
            return db.collection('users').where('email', '==', email).get();
        })
            .then((snapshot) => {
                if (snapshot.empty) {
                    throw new Error("No account found with this email address.");
                }
                // 2. Send Reset Email
                return auth.sendPasswordResetEmail(email);
            })
            .then(() => {
                showModal("Email Sent", "Password reset email sent! Please check your inbox.");
                bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal')).hide();
                forgotPasswordForm.reset();
            })
            .catch((error) => {
                console.error("Reset Password Error:", error);
                showModal("Error", error.message);
            })
            .finally(() => {
                btn.disabled = false;
                btn.textContent = originalText;
            });
    });
}

window.changePassword = function() {
    const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    modal.show();
};

window.deleteAccount = function() {
    showConfirm("Delete Account", "Are you sure you want to delete your account? This action cannot be undone.", () => {
        showConfirm("Final Confirmation", "Start Deletion Process? All your data (appointments, profile) will be permanently removed.", () => {
            const user = auth.currentUser;
            const uid = user.uid;
        
            if (!user) {
                showToast("No user logged in.", "warning");
                return;
            }
        
            // 1. Delete User Data from Firestore
            db.collection("users").doc(uid).delete()
                .then(() => {
                    // 2. Delete User from Auth
                    return user.delete();
                })
                .then(() => {
                    showModal("Account Deleted", "Account deleted successfully.");
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error("Delete Account Error:", error);
                    if (error.code === 'auth/requires-recent-login') {
                        showModal("Security Alert", "For security, please logout and login again to delete your account.");
                    } else {
                        showModal("Error", "Error deleting account: " + error.message);
                    }
                });
        });
    });
};

window.googleLogin = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');
    
    auth.signInWithPopup(provider).then(async (result) => {
        const user = result.user;
        
        // Helper to close modals
        const closeModals = () => {
            const signupModalEl = document.getElementById('signupModal');
            const loginModalEl = document.getElementById('loginModal');
            if (signupModalEl && signupModalEl.classList.contains('show')) {
                bootstrap.Modal.getInstance(signupModalEl).hide();
            }
            if (loginModalEl && loginModalEl.classList.contains('show')) {
                bootstrap.Modal.getInstance(loginModalEl).hide();
            }
        };

        try {
            // 1. Check if user already exists
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (userDoc.exists) {
                // User exists, login complete
                showToast('Logged in with Google!', 'success');
                closeModals();
                return;
            }

            // 2. New User: Handle Profile Creation
            const finalizeCreation = async (finalPhone) => {
                await db.collection('users').doc(user.uid).set({
                    name: user.displayName,
                    email: user.email,
                    phone: finalPhone || 'Not provided',
                    countryCode: '', 
                    role: 'patient', // Force Patient Role for Google Login
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                showToast('Account created with Google!', 'success');
                
                // Celebration for new Google users too!
                 if (typeof confetti === 'function') {
                    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                }
                
                closeModals();
            };

            const phoneNumber = user.phoneNumber;
            if (!phoneNumber) {
                showInputModal(
                    "Phone Number Required", 
                    "Google didn't provide your phone number. Please enter it to complete your profile:", 
                    (inputPhone) => {
                        finalizeCreation(inputPhone);
                    },
                    ""
                );
            } else {
                finalizeCreation(phoneNumber);
            }

        } catch (error) {
            console.error("Error in Google Login flow:", error);
            showToast("Login Error: " + error.message, "danger");
        }

    }).catch((error) => {
        console.error(error);
        showToast(error.message, "danger");
    });
};

// Signup Logic
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  // Real-time Password Strength Check
  const passInput = document.getElementById("signupPassword");
  const strengthBar = document.getElementById("passwordStrengthBar");
  const strengthText = document.getElementById("passwordStrengthText");

  if (passInput && strengthBar && strengthText) {
      passInput.addEventListener("input", () => {
          const val = passInput.value;
          const hasNumber = /[0-9]/.test(val);
          const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(val);
          const isLongEnough = val.length >= 8;

          // Reset
          strengthBar.className = "progress-bar";
          
          if (!val) {
              strengthBar.style.width = "0%";
              strengthText.textContent = "";
              return;
          }

          if (hasNumber && hasSymbol && isLongEnough) {
              // Strong (Green)
              strengthBar.style.width = "100%";
              strengthBar.classList.add("bg-success");
              strengthText.textContent = "Strong";
              strengthText.className = "text-success small";
          } else if (hasNumber && hasSymbol) {
              // Medium (Yellow) - Meets requirements but short
              strengthBar.style.width = "66%";
              strengthBar.classList.add("bg-warning");
              strengthText.textContent = "Medium (Add more characters)";
              strengthText.className = "text-warning small";
          } else {
              // Weak (Red) - Doesn't meet core requirements
              strengthBar.style.width = "33%";
              strengthBar.classList.add("bg-danger");
              strengthText.textContent = "Weak (Need number + symbol)";
              strengthText.className = "text-danger small";
          }
      });
  }

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;
    const phone = document.getElementById('signupPhone').value;
    const countryCode = document.getElementById('signupCountry').value;
    
    // Phone Validation
    const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
    if (countryCode === '+91' && cleanPhone.length !== 10) {
        showToast("Please enter a valid 10-digit phone number for India.", "warning");
        return;
    }
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
        showToast("Please enter a valid phone number.", "warning");
        return;
    }
    
    if (password !== confirmPassword) {
        showToast("Passwords do not match!", "warning");
        return;
    }

    const passwordRegex = /(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/;
    if (!passwordRegex.test(password)) {
        showModal("Weak Password", "Password must contain at least one number and one symbol (e.g., @, #, $).");
        return;
    }
    
    const role = 'patient'; 

    const isValidDomain = await verifyEmailDomain(email);
    if (!isValidDomain) {
        showToast("Invalid email domain.", "warning");
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((cred) => {
            return cred.user.sendEmailVerification()
                .then(() => {
                    return db.collection("users").doc(cred.user.uid).set({
                        name: name,
                        email: email,
                        phone: phone,
                        countryCode: countryCode, 
                        role: role,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        leaveDates: [] 
                    });
                })
                .then(() => {
                    console.log("User created and logged in");
                    const modal = bootstrap.Modal.getInstance(
                        document.getElementById("signupModal")
                    );
                    modal.hide();
                    signupForm.reset();
                    
                    // Celebration!
                    if (typeof confetti === 'function') {
                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 }
                        });
                    }
                    
                    showModal("🎉 Welcome to Health Sphere!", "Congratulations! Your account has been successfully created.");
                });
      })
      .catch((error) => {
        console.error("Signup Error:", error);
        if (error.code === 'auth/email-already-in-use') {
            showToast("Email already registered.", "warning");
        } else if (error.code === 'auth/invalid-email') {
            showToast("Invalid email address.", "warning");
        } else {
            showToast(error.message, "danger");
        }
      });
  });
}

// Login Logic
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const errorMsg = document.getElementById("loginErrorMessage");
    const modalContent = document.querySelector("#loginModal .modal-content");

    // Reset error state
    if (errorMsg) {
        errorMsg.classList.add("d-none");
        errorMsg.textContent = "";
    }

    auth
      .signInWithEmailAndPassword(email, password)
      .then((cred) => {
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("loginModal")
        );
        modal.hide();
        loginForm.reset();
        showToast("Logged in successfully!", "success");
      })
      .catch((error) => {
        console.error("Login Error:", error);
        
        let message = "Invalid email or password.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            message = "Invalid email or password.";
        } else if (error.code === 'auth/too-many-requests') {
            message = "Too many failed attempts. Please try again later.";
        } else {
            message = error.message;
        }

        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.classList.remove("d-none");
            
            // Add shake animation
            if (modalContent) {
                modalContent.classList.add("shake");
                setTimeout(() => modalContent.classList.remove("shake"), 500);
            }
        } else {
            // Fallback if element missing (e.g. admin page?)
            showToast(message, "danger");
        }
      });
  });
}

// Logout Logic
window.logout = function () {
  auth
    .signOut()
    .then(() => {
      alert("Logged out successfully");
    })
    .catch((error) => {
      console.error("Sign out error", error);
    });
};

// --- Doctor Leave Management ---

function loadLeaveDates() {
    if (!currentUser || currentUser.role !== 'doctor') return;
    
    const list = document.getElementById('leaveDatesList');
    if (!list) return;

    db.collection("users").doc(currentUser.uid).onSnapshot(doc => {
        const data = doc.data();
        let dates = data.leaveDates || [];
        
        // --- Auto-Cleanup Past Dates ---
        const today = new Date().toISOString().split('T')[0];
        const pastDates = dates.filter(d => d < today);
        
        if (pastDates.length > 0) {
            console.log("Cleaning up past leave dates:", pastDates);
            // Update Firestore to remove past dates (this will trigger onSnapshot again)
            db.collection("users").doc(currentUser.uid).update({
                leaveDates: firebase.firestore.FieldValue.arrayRemove(...pastDates)
            }).catch(err => console.error("Error cleaning up dates:", err));
            // We can return here and let the next snapshot update the UI
            return; 
        }

        if (dates.length === 0) {
            list.innerHTML = '<li class="list-group-item text-center text-muted py-3">No leave dates marked.</li>';
        } else {
            // Sort dates
            dates.sort();
            
            list.innerHTML = dates.map(date => {
                const d = new Date(date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                return `
                <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                    <span class="fw-medium text-dark"><i class="bi bi-calendar-event me-2 text-muted"></i>${d}</span>
                    <button class="btn btn-sm btn-outline-danger border-0 rounded-circle p-2" onclick="removeLeaveDate('${date}')" title="Remove">
                        <i class="bi bi-trash"></i>
                    </button>
                </li>
            `}).join('');
        }
    });
}

window.addLeaveDateRange = function() {
    console.log("addLeaveDateRange called");
    const startDateInput = document.getElementById('leaveStartDate');
    const endDateInput = document.getElementById('leaveEndDate');
    
    const startStr = startDateInput.value;
    const endStr = endDateInput.value;
    
    if (!startStr || !endStr) {
        showToast("Please select both Start and End dates.", "warning");
        return;
    }
    
    if (startStr > endStr) {
        showToast("End date cannot be before Start date.", "warning");
        return;
    }

    if (!currentUser) return;

    // Generate Array of Dates
    const datesToAdd = [];
    let current = new Date(startStr);
    const end = new Date(endStr);
    
    while (current <= end) {
        datesToAdd.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    
    // We need to wrap the rest in a function to handle the async confirmation flow
    const proceedWithAdd = () => {
        // Check for existing appointments on these dates
        const batchCheck = datesToAdd.map(date => 
            db.collection("appointments")
                .where("doctorName", "==", currentUser.name)
                .where("date", "==", date)
                .get()
        );

        Promise.all(batchCheck).then(snapshots => {
            const conflictDates = [];
            snapshots.forEach((snap, index) => {
                // Manual filtering to avoid composite index requirement
                const hasActiveAppointments = snap.docs.some(doc => doc.data().status !== 'cancelled');
                
                if (hasActiveAppointments) {
                    conflictDates.push(datesToAdd[index]);
                }
            });

            if (conflictDates.length > 0) {
                showModal("Schedule Conflict", `Cannot mark leave on the following dates because you have appointments:<br><b>${conflictDates.join(", ")}</b>`);
                return;
            }

            // Proceed to update
            db.collection("users").doc(currentUser.uid).update({
                leaveDates: firebase.firestore.FieldValue.arrayUnion(...datesToAdd)
            }).then(() => {
                showToast("Availability updated.", "success");
                startDateInput.value = '';
                endDateInput.value = '';
            }).catch(err => {
                console.error("Error adding leave dates:", err);
                showToast("Error updating availability.", "danger");
            });

        }).catch(err => {
            console.error("Error checking appointments:", err);
            showToast("Error verifying schedule.", "danger");
        });
    };

    if (datesToAdd.length > 30) {
         showConfirm("Large Range", `You are about to mark ${datesToAdd.length} days as unavailable. Continue?`, proceedWithAdd);
    } else {
        proceedWithAdd();
    }
};

window.removeLeaveDate = function(date) {
    showConfirm("Remove Leave", "Remove this date from leave?", () => {
        db.collection("users").doc(currentUser.uid).update({
            leaveDates: firebase.firestore.FieldValue.arrayRemove(date)
        }).then(() => {
            // UI updates automatically
             showToast("Date removed from leave.", "success");
        }).catch(err => {
            console.error("Error removing leave date:", err);
            showToast("Error removing leave date.", "danger");
        });
    });
};

// --- Auto-Location Feature ---
window.fillCurrentLocation = function() {
    console.log("fillCurrentLocation called");
    const addressField = document.getElementById('patientAddress');
    if (!addressField) {
        console.error("Address field not found");
        return;
    }

    if (!navigator.geolocation) {
        showToast("Geolocation is not supported by your browser.", "warning");
        return;
    }

    const originalPlaceholder = addressField.placeholder;
    addressField.placeholder = "Fetching location...";
    addressField.value = ""; // Clear current value to show placeholder

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Fetching address for: ${latitude}, ${longitude}`);

        // Use OpenStreetMap Nominatim API for reverse geocoding
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: {
                'User-Agent': 'HealthSphereApp/1.0'
            }
        })
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then(data => {
                if (data && data.display_name) {
                    addressField.value = data.display_name;
                } else {
                     showToast("Could not determine address.", "warning");
                }
            })
            .catch(err => {
                console.error("Error fetching address:", err);
                showToast("Error fetching address details.", "danger");
            })
            .finally(() => {
                addressField.placeholder = originalPlaceholder || "";
            });

    }, (error) => {
        console.error("Geolocation error:", error);
        let msg = "Unable to retrieve your location.";
        if (error.code === 1) msg = "Location access denied. Please enable permissions.";
        showToast(msg, "warning");
        addressField.placeholder = originalPlaceholder || "";
    });
};

// Handle Booking Form Submission
const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
    const doctorSelect = document.getElementById("doctorName");
    const dateInput = document.getElementById("date");
    const timeSelect = document.getElementById("time");

    // Populate Doctors Dynamically
    function populateDoctorDropdown() {
        if (!doctorSelect) return;
        
        db.collection("users").where("role", "==", "doctor").get()
        .then((snapshot) => {
            let options = '<option value="" selected disabled>Select Doctor</option>';
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Store specialization in data-attribute
                options += `<option value="${data.name}" data-spec="${data.specialization || ''}">${data.name} (${data.specialization || 'General'})</option>`;
            });
            doctorSelect.innerHTML = options;
        })
        .catch(err => console.error("Error loading doctors:", err));
    }
    
    // Call it globally
    window.populateDoctorDropdown = populateDoctorDropdown;

  // Disable past dates
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);

// Update checkAvailability to respect leave dates
function checkAvailability() {
      const doctor = doctorSelect.value;
      const date = dateInput.value;

      if (!doctor || !date) {
          timeSelect.disabled = true;
          timeSelect.innerHTML = '<option value="" selected disabled>Select Date First</option>';
          return;
      }

      timeSelect.disabled = true;
      timeSelect.innerHTML = '<option value="" selected disabled>Loading slots...</option>';

      // 1. Get Doctor's Leave Dates first
      db.collection("users").where("name", "==", doctor).limit(1).get()
      .then(docSnap => {
          if (!docSnap.empty) {
              const docData = docSnap.docs[0].data();
              if (docData.leaveDates && docData.leaveDates.includes(date)) {
                  throw new Error("DOCTOR_ON_LEAVE");
              }
          }
          return db.collection("appointments")
              .where("doctorName", "==", doctor)
              .where("date", "==", date)
              .get();
      })
      .then((querySnapshot) => {
              const bookedTimes = [];
              querySnapshot.forEach((doc) => {
                  bookedTimes.push(doc.data().time);
              });

              // Reset Options
              timeSelect.innerHTML = `
                  <option value="" selected disabled>Select Time</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
              `;

              // Get Current Date & Time
              const now = new Date();
              const selectedDate = new Date(date);
              const isToday = selectedDate.toDateString() === now.toDateString();
              const currentHour = now.getHours();
              const currentMinutes = now.getMinutes();

              // Disable slots
              let availableCount = 0;
              Array.from(timeSelect.options).forEach(option => {
                  if (!option.value) return; // Skip placeholder

                  const [slotHourStr, slotMinuteStr] = option.value.split(':');
                  const slotHour = parseInt(slotHourStr, 10);
                  const slotMinute = parseInt(slotMinuteStr, 10);

                  // Check if Booked
                  if (bookedTimes.includes(option.value)) {
                      option.disabled = true;
                      option.textContent += " (Booked)";
                  } 
                  // Check if Past Time (Only if Today)
                  else if (isToday) {
                      if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinutes)) {
                          option.disabled = true;
                          option.textContent += " (Unavailable)";
                      } else {
                          availableCount++;
                      }
                  } else {
                      availableCount++;
                  }
              });

              // Always enable to show greyed out options if all are unavailable
              timeSelect.disabled = false;
              
              if (availableCount === 0) {
                  // Optional: Update placeholder text to indicate full booking?
                  // timeSelect.options[0].textContent = "No slots available";
              }
          })
          .catch((error) => {
              if (error.message === "DOCTOR_ON_LEAVE") {
                  timeSelect.innerHTML = '<option value="" selected disabled>Doctor is on leave</option>';
                  timeSelect.disabled = true;
              } else {
                  console.error("Error checking availability: ", error);
                  timeSelect.innerHTML = '<option value="" selected disabled>Error loading slots</option>';
              }
          });
  }

  doctorSelect.addEventListener('change', checkAvailability);
  dateInput.addEventListener('change', checkAvailability);

  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentUser) {
      showModal("Login Required", "Please login to book an appointment");
      return;
    }

    // Double Check on Submit (Prevent Race Condition)
    const doctor = doctorSelect.value;
    const date = dateInput.value;
    const time = timeSelect.value;
    
    // Get Specialization from selected option
    const selectedOption = doctorSelect.options[doctorSelect.selectedIndex];
    const specialization = selectedOption ? selectedOption.getAttribute('data-spec') : '';

    const snapshot = await db.collection("appointments")
        .where("doctorName", "==", doctor)
        .where("date", "==", date)
        .where("time", "==", time)
        .get();

    if (!snapshot.empty) {
        showModal("Slot Taken", "Sorry, this slot was just booked by someone else. Please choose another time.");
        checkAvailability(); // Refresh slots
        return;
    }

        const data = {
            user_id: currentUser.uid,
            patientName: document.getElementById('patientName').value,
            patientGender: document.getElementById('patientGender').value,
            patientAddress: document.getElementById('patientAddress').value,
            patientEmail: currentUser.email, // Save email for doctor
            patientPhone: currentUser.phone ? `${currentUser.countryCode} ${currentUser.phone}` : 'Not provided', // Save phone
            doctorName: doctor,
            doctorSpecialization: specialization, // Save Specialization
            date: date,
            time: time,
            reason: document.getElementById('reason').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

    try {
      await db.collection("appointments").add(data);
      showToast("Appointment Booked Successfully!", "success");
      bookingForm.reset();
      timeSelect.disabled = true; // Reset time select
      timeSelect.innerHTML = '<option value="" selected disabled>Select Date First</option>';
      
      bootstrap.Modal.getInstance(
        document.getElementById("bookingModal"),
      ).hide();
      loadPatientAppointments(); // Refresh patient view
    } catch (error) {
      console.error("Error:", error);
      showToast("Error booking appointment.", "danger");
    }
  });
}

// Load Patient Appointments
function loadPatientAppointments() {
  const upcomingList = document.getElementById("myAppointmentsList");
  const historyList = document.getElementById("patientHistoryList");
  
  if (!upcomingList || !historyList) return;
  if (!currentUser) return; // Wait for auth

  upcomingList.innerHTML = '<div class="text-center p-3">Loading...</div>';
  historyList.innerHTML = '<div class="text-center p-3">Loading...</div>';

  // 1. Start fetching appointments immediately (Real-time)
  // Use patientEmail as it appears to be the most reliable field for this user's data history
  db.collection("appointments")
    .where("patientEmail", "==", currentUser.email)
    .onSnapshot((querySnapshot) => {
        const upcoming = [];
        const history = [];
        const today = new Date().toISOString().split('T')[0];

        // 2. Fetch Doctors (Non-blocking)
        db.collection("users").where("role", "==", "doctor").get()
        .then(doctorSnapshot => {
            const doctorsMap = {};
            doctorSnapshot.forEach(doc => {
                const data = doc.data();
                doctorsMap[data.name] = data.specialization || 'Specialist';
            });
            return doctorsMap;
        })
        .then((doctorsMap) => {
             processAppointments(querySnapshot, doctorsMap, upcoming, history, today);
             renderLists(upcoming, history);
        })
        .catch(err => {
            console.error("Error fetching doctors, showing defaults", err);
            processAppointments(querySnapshot, {}, upcoming, history, today);
            renderLists(upcoming, history);
        });

    }, (error) => {
         console.error("Error listening to appointments:", error);
         upcomingList.innerHTML = '<div class="text-danger text-center">Error loading data.</div>';
    });

    // Helper functions to avoid code duplication in the async flow
    function processAppointments(snapshot, doctorMap, upcomingArr, historyArr, todayStr) {
        // Clear arrays before refilling (pass by reference, but we need to empty them if this is a re-run? 
        // actually querySnapshot loop creates new structs, but we need to make sure we don't duplicate if we ran this logic twice?
        // 'upcomingArr' comes in empty from the scope above, so it is fine.
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.hiddenForPatient) return;
            
            const appt = { id: doc.id, ...data };
            
            // Resolve Specialization
            const mapSpec = doctorMap ? doctorMap[appt.doctorName] : null;
            appt.displaySpecialization = appt.doctorSpecialization || mapSpec || 'Specialist';

            if (data.date < todayStr || data.status === 'completed') {
                historyArr.push(appt);
            } else {
                upcomingArr.push(appt);
            }
        });
    }

    function renderLists(upcoming, history) {
        if(!upcomingList || !historyList) return;

        // Render Upcoming
        if (upcoming.length === 0) {
            upcomingList.innerHTML = '<div class="text-muted text-center p-3">No upcoming appointments.</div>';
        } else {
            upcoming.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
            upcomingList.innerHTML = upcoming.map((appt) => `
                    <div class="list-group-item d-flex justify-content-between align-items-center py-3">
                        <div>
                            <h5 class="mb-1 fw-bold">${appt.doctorName} <span class="badge bg-info text-dark ms-2" style="font-size: 0.7em;">${appt.displaySpecialization}</span></h5>
                            <p class="mb-1 text-muted"><i class="bi bi-calendar-event me-2"></i>${appt.date} at ${appt.time}</p>
                            <small class="text-primary">${appt.reason}</small>
                        </div>
                        <div>
                         <span class="badge bg-success rounded-pill me-2">Confirmed</span>
                         <button class="btn btn-sm btn-outline-primary rounded-circle" onclick="openEditAppointmentModal('${appt.id}', '${appt.patientName.replace(/'/g, "\\'")}', '${appt.patientGender}', '${appt.patientAddress.replace(/'/g, "\\'")}', '${appt.reason.replace(/'/g, "\\'")}')" title="Edit Details"><i class="bi bi-pencil-square"></i></button>
                        </div>
                    </div>
                `).join("");
        }

        // Render History
        if (history.length === 0) {
            historyList.innerHTML = '<div class="text-muted text-center p-3">No past appointments.</div>';
        } else {
            history.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)); 
            historyList.innerHTML = history.map((appt) => `
                <div class="list-group-item list-group-item-light d-flex justify-content-between align-items-center py-3 opacity-75">
                    <div>
                        <h5 class="mb-1 fw-bold text-muted">${appt.doctorName} <span class="badge bg-light text-secondary border ms-2" style="font-size: 0.7em;">${appt.displaySpecialization}</span></h5>
                        <p class="mb-1 text-muted"><i class="bi bi-calendar-check me-2"></i>${appt.date}</p>
                         <small class="text-muted">${appt.reason}</small>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                     <span class="badge ${appt.status === 'completed' ? 'bg-secondary' : 'bg-warning text-dark'} rounded-pill">${appt.status === 'completed' ? 'Completed' : 'Past'}</span>
                     <button class="btn btn-sm btn-outline-danger rounded-circle" onclick="deleteAppointment('${appt.id}')" title="Delete from History"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            `).join("");
        }
    }
}

// Open Edit Modal
window.openEditAppointmentModal = function(id, name, gender, address, reason) {
    document.getElementById('editApptId').value = id;
    document.getElementById('editPatientName').value = name;
    document.getElementById('editPatientGender').value = gender;
    document.getElementById('editPatientAddress').value = address;
    document.getElementById('editReason').value = reason;

    const modal = new bootstrap.Modal(document.getElementById('editAppointmentModal'));
    modal.show();
}

// Handle Edit Form Submit
const editApptForm = document.getElementById('editAppointmentForm');
if (editApptForm) {
    editApptForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('editApptId').value;
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        db.collection("appointments").doc(id).update({
            patientName: document.getElementById('editPatientName').value,
            patientGender: document.getElementById('editPatientGender').value,
            patientAddress: document.getElementById('editPatientAddress').value,
            reason: document.getElementById('editReason').value
        }).then(() => {
            showToast("Appointment updated successfully!", "success");
            bootstrap.Modal.getInstance(document.getElementById('editAppointmentModal')).hide();
            submitBtn.textContent = 'Save Changes';
            submitBtn.disabled = false;
        }).catch((error) => {
            console.error("Error updating appointment:", error);
            showToast("Error updating appointment.", "danger");
            submitBtn.textContent = 'Save Changes';
            submitBtn.disabled = false;
        });
    });
}

// --- NEW: Auto-Complete Appointments Logic ---
function checkAppointmentCompletion() {
    if (!currentUser) return;

    // Run for both interactions (Doctor viewing their schedule, Patient viewing theirs)
    // We query based on role to capture relevant docs.
    // Optimization: Only query "confirmed" or undefined status to minimize reads?
    // For now, simpler to query relevant user_id/doctorName.

    let query = db.collection("appointments");

    if (currentUser.role === 'doctor') {
        query = query.where("doctorName", "==", currentUser.name);
    } else {
        query = query.where("user_id", "==", currentUser.uid);
    }

    query.get().then((snapshot) => {
        const batch = db.batch();
        let updateCount = 0;
        const now = new Date();

        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Skip if already completed or cancelled
            if (data.status === 'completed' || data.status === 'cancelled') return;

            // Parse Date & Time
            // Format: date="YYYY-MM-DD", time="HH:mm"
            if (data.date && data.time) {
                const apptStart = new Date(`${data.date}T${data.time}`);
                
                // Add 1 Hour for "Completion" time
                const apptEnd = new Date(apptStart.getTime() + 60 * 60 * 1000); 

                // Check if Now is past End Time
                if (now >= apptEnd) {
                    const docRef = db.collection("appointments").doc(doc.id);
                    batch.update(docRef, { status: 'completed' });
                    updateCount++;
                }
            }
        });

        if (updateCount > 0) {
            batch.commit()
                .then(() => console.log(`Auto-completed ${updateCount} appointments.`))
                .catch(err => console.error("Error auto-completing appointments:", err));
        }
    }).catch(err => console.error("Error checking appointment completion:", err));
}

// Run check periodically (e.g., every minute)
setInterval(checkAppointmentCompletion, 60000); // 60s
// Also run once on load (after a short delay to ensure auth)
setTimeout(checkAppointmentCompletion, 5000);

// ---------------------------------------------

// Load Doctor Dashboard (Embedded in Index)
function loadDoctorEmbeddedSchedule() {
    const upcomingList = document.getElementById("doctorScheduleList");
    const historyList = document.getElementById("doctorHistoryList");

    if (!upcomingList || !currentUser) return;

    upcomingList.innerHTML = '<p class="text-center py-3">Loading schedule...</p>';
    if(historyList) historyList.innerHTML = '<p class="text-center py-3">Loading...</p>';

    const today = new Date().toISOString().split('T')[0];

    db.collection("appointments")
        .where("doctorName", "==", currentUser.name)
        .onSnapshot((querySnapshot) => {
            const upcoming = [];
            const history = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // We do NOT return early here for hiddenForDoctor anymore,
                // because we want to stick them in the history array to render as placeholders.
                // if (data.hiddenForDoctor) return; 

                const appt = { id: doc.id, ...data };
                // History if: Date is in past OR Status is 'completed'
                if (data.date < today || data.status === 'completed') {
                    history.push(appt);
                } else {
                    upcoming.push(appt);
                }
            });

            // Render Upcoming
            if (upcoming.length === 0) {
                upcomingList.innerHTML = '<p class="text-muted text-center py-3">No upcoming appointments.</p>';
            } else {
                upcoming.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
                upcomingList.innerHTML = upcoming.map(appt => `
                    <div class="list-group-item d-flex justify-content-between align-items-center py-3">
                        <div>
                            <h5 class="mb-1 fw-bold">${appt.patientName}</h5>
                            <p class="mb-1 text-muted"><i class="bi bi-calendar-event me-2"></i>${appt.date} at ${appt.time}</p>
                            <small class="text-muted">Reason: ${appt.reason}</small>
                        </div>
                        <div>
                             <button class="btn btn-sm btn-outline-success rounded-pill" onclick="completeAppointment('${appt.id}')" title="Mark as Done"><i class="bi bi-check-lg"></i> Done</button>
                        </div>
                    </div>
                `).join("");
            }

            // Render History
            if (historyList) {
                if (history.length === 0) {
                    historyList.innerHTML = '<p class="text-muted text-center py-3">No past appointments.</p>';
                } else {
                    history.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
                    historyList.innerHTML = history.map(appt => {
                        if (appt.hiddenForDoctor) {
                             return `
                                <div class="list-group-item d-flex justify-content-between align-items-center py-3 bg-light opacity-50">
                                    <div>
                                        <h6 class="mb-1 fw-bold text-muted fst-italic">Slot Booked (Archived)</h6>
                                        <p class="mb-1 text-muted"><i class="bi bi-calendar-x me-2"></i>${appt.date} at ${appt.time}</p>
                                    </div>
                                    <span class="badge bg-secondary">Hidden</span>
                                </div>`;
                        }
                        return `
                        <div class="list-group-item d-flex justify-content-between align-items-center py-3 bg-light">
                            <div>
                                <h5 class="mb-1 fw-bold text-muted">${appt.patientName}</h5>
                                <p class="mb-1 text-muted"><i class="bi bi-calendar-check me-2"></i>${appt.date} at ${appt.time}</p>
                                <small class="text-muted">Reason: ${appt.reason}</small>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                 <span class="badge bg-secondary rounded-pill">Completed</span>
                                 <button class="btn btn-sm btn-outline-danger rounded-circle" onclick="deleteAppointment('${appt.id}')" title="Delete from History"><i class="bi bi-trash"></i></button>
                            </div>
                        </div>
                    `}).join("");
                }
            }
        }, (error) => {
            console.error("Error loading doctor schedule:", error);
            upcomingList.innerHTML = '<p class="text-danger text-center">Error loading schedule.</p>';
        });
}

// Load Appointments for Doctor Dashboard (Standalone Page)
function loadAppointments() {
    console.log("loadAppointments called");
    const tableBody = document.getElementById("appointmentsTableBody");
    const statusEl = document.getElementById("doctorDashboardStatus");
    
    if (!tableBody) return;
    
    // Ensure user is logged in
    if (!currentUser) {
        console.log("loadAppointments: waiting for login...");
        if(statusEl) statusEl.textContent = "Waiting for login...";
        return;
    }

    // Role Check
    if (currentUser.role !== 'doctor') {
        console.warn("User is not a doctor:", currentUser.role);
        if(statusEl) statusEl.innerHTML = `<span class="text-danger">Access Restricted. Current role: ${currentUser.role}</span>`;
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-danger">You must be logged in as a Doctor to view this page.</td></tr>';
        return;
    }

    console.log("Loading appointments for doctor:", currentUser.name);

    // Update Status
    if(statusEl) statusEl.innerHTML = `Welcome, <strong>Dr. ${currentUser.name}</strong>. Showing your schedule.`;

    db.collection("appointments")
        .where("doctorName", "==", currentUser.name)
        .onSnapshot((querySnapshot) => {
            const appointments = [];
            const today = new Date().toISOString().split('T')[0];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Filter out completed and past appointments
                // Note: keeping string comparison for date as it works for ISO YYYY-MM-DD
                if (data.status !== 'completed' && data.date >= today) {
                    appointments.push({ id: doc.id, ...data });
                }
            });

            if (appointments.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-muted">No upcoming appointments found for Dr. ${currentUser.name}.</td></tr>`;
            } else {
                appointments.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
                tableBody.innerHTML = appointments.map(appt => `
                    <tr>
                        <td class="p-4">
                            <div class="d-flex align-items-center">
                                <div class="avatar-initial rounded-circle bg-light text-primary me-3 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                    ${appt.patientName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h6 class="mb-0 fw-bold">${appt.patientName}</h6>
                                </div>
                            </div>
                        </td>
                        <td class="p-4">${appt.patientEmail || '<span class="text-muted">-</span>'}</td>
                        <td class="p-4">${appt.patientPhone || '<span class="text-muted">-</span>'}</td>
                        <td class="p-4"><span class="badge bg-info text-dark">${appt.doctorName}</span></td>
                        <td class="p-4">
                            <div class="d-flex flex-column">
                                <span class="fw-bold">${appt.date}</span>
                                <small class="text-muted">${appt.time}</small>
                            </div>
                        </td>
                        <td class="p-4">${appt.reason}</td>
                        <td class="p-4 text-end">
                            <button class="btn btn-sm btn-success rounded-pill px-3" onclick="completeAppointment('${appt.id}')">
                                <i class="bi bi-check-lg me-1"></i> Done
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }, (error) => {
            console.error("Error loading appointments:", error);
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-danger">Error loading data: ${error.message}</td></tr>`;
        });
}

// Complete Appointment (Doctor Action)
window.completeAppointment = function(id) {
     showConfirm("Complete Appointment", "Mark this appointment as completed?", function() {
        db.collection("appointments").doc(id).update({
            status: 'completed'
        }).then(() => {
            showToast('Appointment marked as completed.', 'success');
        }).catch((error) => {
            console.error("Error completing appointment:", error);
            showToast("Error updating status.", "danger");
        });
    });
}

// Delete Appointment (Universal - Soft Delete for Users, Hard Delete for Admin)
window.deleteAppointment = function(id) {
    if (!currentUser) return;

    const isHistory = true; // Assuming this is primarily for history based on context
    let title = "Remove from History";
    let msg = "Are you sure you want to remove this appointment from your history?";

    if (currentUser.role === 'admin') {
        title = "Delete Appointment";
        msg = "Are you sure you want to permanently delete this appointment? This cannot be undone.";
    }

    showConfirm(title, msg, function() {
        // 1. Admin: Hard Delete
        if (currentUser.role === 'admin') {
            db.collection("appointments").doc(id).delete()
            .then(() => {
                // UI auto-updates
                showToast("Appointment deleted permanently.", "success");
            }).catch(err => {
                console.error("Error deleting:", err);
                showToast("Error deleting appointment.", "danger");
            });
            return;
        }

        // 2. Patient/Doctor: Soft Delete (Hide)
        const updateData = {};
        if (currentUser.role === 'patient') {
            updateData.hiddenForPatient = true;
        } else if (currentUser.role === 'doctor') {
            updateData.hiddenForDoctor = true;
        }

        db.collection("appointments").doc(id).update(updateData)
        .then(() => {
             // UI auto-updates via onSnapshot
             showToast("Appointment removed from history.", "success");
        }).catch(err => {
             console.error("Error removing from history:", err);
             showToast("Error updating history.", "danger");
        });
    });
}

// Check and Enforce Doctor Specialization
function checkDoctorSpecialization() {
    if (!currentUser || currentUser.role !== 'doctor') return;

    if (!currentUser.specialization || currentUser.specialization.trim() === "") {
        const modalEl = document.getElementById('doctorProfileModal');
        if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    }
}

// Handle Doctor Profile Form Submission
const doctorProfileForm = document.getElementById('doctorProfileForm');
if (doctorProfileForm) {
    doctorProfileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const specialization = document.getElementById('doctorSpecialization').value;
        const submitBtn = this.querySelector('button[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        db.collection("users").doc(currentUser.uid).update({
            specialization: specialization
        }).then(() => {
            // Update local currentUser object
            currentUser.specialization = specialization;
            
            showToast("Profile updated successfully!", "success");
            bootstrap.Modal.getInstance(document.getElementById('doctorProfileModal')).hide();
            
            // Re-render auth UI to reflect changes if needed
            // (Optional)
        }).catch((error) => {
            console.error("Error updating profile:", error);
            showModal("Error", "Error updating profile: " + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save & Continue';
        });
    });
}



// Render Appointments Function
function renderAppointments(appointments) {
  const tableBody = document.getElementById("appointmentsTableBody");
  if (!tableBody) return;

  if (appointments.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="7" class="text-center p-4 text-muted">No appointments found.</td></tr>';
    return;
  }

    tableBody.innerHTML = appointments.map(appt => `
        <tr>
            <td class="p-4 fw-bold">${appt.patientName}</td>
            <td class="p-4 small">${appt.patientEmail || '-'}</td>
            <td class="p-4 small">${appt.patientPhone || '-'}</td>
            <td class="p-4"><span class="badge bg-info text-dark bg-opacity-10 border border-info border-opacity-25">${appt.doctorName}</span></td>
            <td class="p-4">${appt.date} at ${appt.time}</td>
            <td class="p-4 text-muted">${appt.reason}</td>
            <td class="p-4 text-end">
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAppointment('${appt.id}')"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// Search Functionality
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredAppointments = allAppointments.filter((appt) =>
      appt.patientName.toLowerCase().includes(searchTerm),
    );
    renderAppointments(filteredAppointments);
  });
}

// Generic Confirmation Modal Logic
window.showConfirmModal = function(title, message, onConfirm) {
    const modalEl = document.getElementById('confirmationModal');
    if (!modalEl) {
        // Fallback if modal is missing (e.g., on index.html)
        if (confirm(message)) onConfirm();
        return;
    }

    const titleEl = document.getElementById('confirmationModalTitle');
    const bodyEl = document.getElementById('confirmationModalBody');
    const confirmBtn = document.getElementById('confirmationModalConfirmBtn');

    titleEl.textContent = title;
    bodyEl.textContent = message;

    // Clone button to remove old event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.onclick = function() {
        onConfirm();
        bootstrap.Modal.getInstance(modalEl).hide();
    };

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

// Delete Appointment logic is already handled by the window.deleteAppointment function above (lines ~1564).
// Removing duplicate definition to avoid shadowing and inconsistency.

// Delete User
window.deleteUser = function(id) {
    showConfirm("Delete User", "Are you sure you want to delete this user? This action cannot be undone.", function() {
        db.collection("users").doc(id).delete().then(() => {
            loadAdminData();
             showToast("User record deleted from database.", "success");
        }).catch((error) => {
            console.error("Error removing user: ", error);
            showModal("Error", "Error deleting user: " + error.message);
        });
    });
}

// Promote to Doctor
window.promoteToDoctor = function(id, name) {
    showConfirm("Promote User", `Are you sure you want to promote ${name} to a Doctor?`, function() {
        db.collection("users").doc(id).update({
            role: 'doctor'
        }).then(() => {
            loadAdminData();
            showToast(`${name} is now a Doctor!`, "success");
        }).catch((error) => {
            console.error("Error promoting user: ", error);
            showModal("Error", "Error promoting user: " + error.message);
        });
    });
}

// --- User Ban/Suspend Logic ---
window.toggleBanStatus = function(userId, ban) {
    const action = ban ? "ban" : "unban";
    showConfirm(`${action.charAt(0).toUpperCase() + action.slice(1)} User`, `Are you sure you want to ${action} this user?`, () => {
        db.collection("users").doc(userId).update({
            isBanned: ban
        })
        .then(() => {
            showToast(`User has been ${ban ? 'banned' : 'unbanned'} successfully.`, "success");
            loadAdminData(); // Refresh table
        })
        .catch((error) => {
            console.error("Error updating user status:", error);
            showToast("Failed to update status.", "danger");
        });
    });
}

// Demote to Patient
window.demoteToPatient = function(id, name) {
    showConfirm("Demote User", `Are you sure you want to demote ${name} to a Patient? They will no longer have access to the doctor dashboard.`, function() {
        db.collection("users").doc(id).update({
            role: 'patient'
        }).then(() => {
            loadAdminData();
            showToast(`${name} is now a Patient.`, "success");
        }).catch((error) => {
            console.error("Error demoting user: ", error);
            showModal("Error", "Error demoting user: " + error.message);
        });
    });
}

// Filter Admin Tables
window.filterAdminTable = function(inputId, tableId) {
    const input = document.getElementById(inputId);
    const filter = input ? input.value.toUpperCase() : '';
    const table = document.getElementById(tableId);
    
    console.log(`Filtering ${tableId} with "${filter}"`); // DEBUG

    if (!table) return;
    const tr = table.getElementsByTagName("tr");

    for (let i = 0; i < tr.length; i++) {
        const tds = tr[i].getElementsByTagName("td");
        let shown = false;
        
        // If filter is empty, show all
        if (!filter) {
            shown = true;
        } else {
            // Search all columns
            for(let j=0; j<tds.length; j++) {
                 if (tds[j]) {
                     const txtValue = tds[j].textContent || tds[j].innerText;
                     if (txtValue.toUpperCase().indexOf(filter) > -1) {
                         shown = true;
                         break;
                     }
                 }
            }
        }
        tr[i].style.display = shown ? "" : "none";
    }
}

// Load Admin Data
function loadAdminData() {
    if (!currentUser || currentUser.role !== 'admin') return;

    // Table Bodies (NEW IDs)
    const allUsersBody = document.getElementById("tbody_users");
    const doctorsBody = document.getElementById("tbody_doctors");
    const patientsBody = document.getElementById("tbody_patients");

    const setLoader = (el) => { if(el) el.innerHTML = '<tr><td colspan="7" class="text-center p-4">Loading...</td></tr>'; }
    setLoader(allUsersBody);
    setLoader(doctorsBody);
    setLoader(patientsBody);

    db.collection("users").get().then((querySnapshot) => {
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });

        // Filter Lists
        const doctorList = users.filter(u => u.role && u.role.toLowerCase().trim() === 'doctor');
        const patientList = users.filter(u => u.role && u.role.toLowerCase().trim() === 'patient');

        console.log(`DEBUG: Total Users: ${users.length}, Doctors: ${doctorList.length}, Patients: ${patientList.length}`);

        // Render Function
        const renderRows = (data, container, label) => {
            if (!container) {
                console.error(`DEBUG: Container for ${label} not found!`);
                return;
            }
            console.log(`DEBUG: Rendering ${data.length} items into ${container.id} (${label})`);
            
            // Explicitly clear
            container.innerHTML = '';

            if (data.length === 0) {
                container.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-muted">No records found.</td></tr>';
                return;
            }
            
            // Debug Row (Visible in Table)
            // container.innerHTML = `<tr class="table-info"><td colspan="7" class="text-center small">DEBUG: Showing ${label} (${data.length})</td></tr>`; 
            
            const rows = data.map(user => {
                const createdDate = user.createdAt && user.createdAt.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A';
                const isBanned = user.isBanned === true;
                const statusBadge = isBanned 
                    ? '<span class="badge bg-danger">Banned</span>' 
                    : '<span class="badge bg-success">Active</span>';
                
                return `
                <tr>
                    <td class="p-4 fw-bold">${user.name || 'N/A'}</td>
                    <td class="p-4 small">${user.email}</td>
                    <td class="p-4"><span class="badge ${user.role === 'doctor' ? 'bg-success' : (user.role === 'admin' ? 'bg-danger' : 'bg-secondary')}">${user.role || 'patient'}</span></td>
                    <td class="p-4 small">${user.phone || '-'}</td>
                    <td class="p-4 small">${createdDate}</td>
                    <td class="p-4 small">${statusBadge}</td>
                    <td class="p-4 text-end">
                        ${!isBanned ? 
                            `<button class="btn btn-sm btn-outline-danger me-2" onclick="toggleBanStatus('${user.id}', true)" title="Ban User"><i class="bi bi-slash-circle"></i> Ban</button>` : 
                            `<button class="btn btn-sm btn-outline-success me-2" onclick="toggleBanStatus('${user.id}', false)" title="Unban User"><i class="bi bi-check-circle"></i> Unban</button>`
                        }
                        ${user.role === 'patient' && !isBanned ? 
                            `<button class="btn btn-sm btn-outline-primary me-2" onclick="promoteToDoctor('${user.id}', '${user.name}')" title="Promote to Doctor"><i class="bi bi-person-up"></i> Promote</button>` : 
                            (user.role === 'doctor' && !isBanned ? 
                            `<button class="btn btn-sm btn-outline-warning me-2" onclick="demoteToPatient('${user.id}', '${user.name}')" title="Demote to Patient"><i class="bi bi-person-down"></i> Demote</button>` : '')
                        }
                        ${user.role !== 'admin' ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${user.id}')" title="Delete User"><i class="bi bi-trash"></i></button>` : ''}
                    </td>
                </tr>
            `}).join('');
            
            container.innerHTML += rows;
        };

        // Render All Tabs with Explicit Labels and Variables
        renderRows(users, allUsersBody, "All Users");
        renderRows(doctorList, doctorsBody, "Doctors");
        renderRows(patientList, patientsBody, "Patients");

    }).catch(error => {
        console.error("Error loading admin data:", error);
    });
}

// Profile Image Logic Removed

// Settings Form Submission
const settingsForm = document.getElementById('settingsForm');
if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newName = document.getElementById('settingsName').value;
        const newPhone = document.getElementById('settingsPhone').value;
        const submitBtn = settingsForm.querySelector('button[type="submit"]');

        try {
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            // 4. Save to Firestore (Only Name and Phone)
            const userRef = db.collection("users").doc(currentUser.uid);
            await userRef.update({
                name: newName,
                phone: newPhone
            });
            console.log("Firestore updated.");
            
            // 3. Update local state
            currentUser.name = newName;
            currentUser.phone = newPhone;
            
            // Render UI updates
            const userNameDisplay = document.getElementById("userNameDisplay");
            if (userNameDisplay) userNameDisplay.textContent = newName;

            // --- NEW: Sync Profile to Future Appointments ---
            try {
                const today = new Date().toISOString().split('T')[0];
                const appointmentsSnapshot = await db.collection("appointments")
                    .where("user_id", "==", currentUser.uid)
                    .get();

                const batch = db.batch();
                let updateCount = 0;

                appointmentsSnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Only update future or non-completed appointments ideally, 
                    // but for simplicity and user expectation, update all active ones.
                    if (data.status !== 'completed' && data.status !== 'cancelled') {
                        const apptRef = db.collection("appointments").doc(doc.id);
                        batch.update(apptRef, {
                            patientName: newName,
                            patientPhone: newPhone // Simple update, user can format if they want
                        });
                        updateCount++;
                    }
                });

                if (updateCount > 0) {
                    await batch.commit();
                    console.log(`Updated ${updateCount} appointments with new profile info.`);
                }
            } catch (syncError) {
                console.error("Error syncing appointments:", syncError);
                // Non-blocking error, user profile still updated
            }
            // ------------------------------------------------
            
            // Success Feedback
            submitBtn.textContent = 'Changes Saved!';
            submitBtn.classList.remove('btn-primary');
            submitBtn.classList.add('btn-success');
            
            setTimeout(() => {
                const modalEl = document.getElementById('settingsModal');
                const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modalInstance.hide();
                
                setTimeout(() => {
                    submitBtn.textContent = 'Save Changes';
                    submitBtn.classList.remove('btn-success');
                    submitBtn.classList.add('btn-primary');
                    submitBtn.disabled = false;
                }, 500);
            }, 1500);
        } catch (error) {
            console.error("Error updating profile:", error);
            submitBtn.textContent = 'Save Changes';
            submitBtn.disabled = false;
            showToast("Error updating profile: " + error.message, "danger");
        }
    });
}

// Check for existing feedback to allow editing
function checkExistingFeedback() {
    const feedbackForm = document.getElementById("feedbackForm");
    if (!feedbackForm || !currentUser) return;

    db.collection("feedback").where("userId", "==", currentUser.uid).get()
    .then((snapshot) => {
        const submitBtn = feedbackForm.querySelector('button[type="submit"]');
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            
            // Pre-fill Form
            document.getElementById("feedbackName").value = data.name;
            document.getElementById("feedbackMessage").value = data.message;
            const ratingRadio = document.getElementById(`star${data.rating}`);
            if (ratingRadio) ratingRadio.checked = true;

            // Set Edit Mode
            feedbackForm.setAttribute("data-mode", "edit");
            feedbackForm.setAttribute("data-doc-id", doc.id);
            if (submitBtn) submitBtn.textContent = "Update Feedback";
        } else {
            // Reset to Create Mode
            feedbackForm.removeAttribute("data-mode");
            feedbackForm.removeAttribute("data-doc-id");
            if (submitBtn) submitBtn.textContent = "Submit Feedback";
            feedbackForm.reset();
        }
    })
    .catch((error) => console.error("Error checking feedback:", error));
}

// Handle Feedback Form Submission
const feedbackForm = document.getElementById("feedbackForm");
if (feedbackForm) {
  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Auth Check
    if (!currentUser) {
        // Direct to Signup Modal
        const signupModalEl = document.getElementById('signupModal');
        if (signupModalEl) {
            const signupModal = new bootstrap.Modal(signupModalEl);
            signupModal.show();
        }
        return;
    }

    const name = document.getElementById("feedbackName").value;
    const message = document.getElementById("feedbackMessage").value;
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const rating = ratingInput ? ratingInput.value : 0;

    if (rating === 0) {
        showToast("Please select a rating.", "warning");
        return;
    }

    const feedbackData = {
        name: name,
        userId: currentUser.uid,
        userRole: currentUser.role || 'patient',
        userSpecialization: currentUser.specialization || '',
        message: message,
        rating: parseInt(rating),
        verified: false, // Re-verify on edit? Maybe keep as is or set to false to re-approve. Let's set verified: false for safety if editing content.
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Check Mode
    const mode = feedbackForm.getAttribute("data-mode");
    const docId = feedbackForm.getAttribute("data-doc-id");

    try {
        if (mode === "edit" && docId) {
            // UPDATE
            await db.collection("feedback").doc(docId).update(feedbackData);
            showToast("Your feedback has been updated!", "success");
        } else {
            // CREATE - Check one last time to prevent duplicates if UI didn't load fast enough
            const existing = await db.collection("feedback").where("userId", "==", currentUser.uid).get();
            if (!existing.empty) {
                showToast("You have already submitted feedback. Updating your existing one instead.", "info");
                await db.collection("feedback").doc(existing.docs[0].id).update(feedbackData);
            } else {
                feedbackData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection("feedback").add(feedbackData);
                showToast("Thank you for your feedback!", "success");
            }
        }

      feedbackForm.reset();
      checkExistingFeedback(); // Refresh form state
      
      // Refresh logic if on feedbacks page
      if (document.getElementById("feedbackList")) {
          loadFeedbacks();
      } else {
          // If on home page, update average display
          loadAverageRating();
      }
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showToast("Error submitting feedback. Please try again.", "danger");
    }
  });
}

// Load Feedbacks Page
window.loadFeedbacks = function() {
    const listContainer = document.getElementById("feedbackList");
    const loader = document.getElementById("loadingFeedbacks");
    
    if (!listContainer) return;

    // Removed orderBy to prevent index errors. Client-side sorting used instead.
    db.collection("feedback")
        .get()
        .then((querySnapshot) => {
            if (loader) loader.classList.add('d-none');
            
            if (querySnapshot.empty) {
                listContainer.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-chat-square-text display-1 text-muted opacity-25"></i>
                        <p class="mt-3 text-muted lead">No feedbacks yet. Be the first to share your experience!</p>
                    </div>`;
                return;
            }

            let feedbacks = [];
            querySnapshot.forEach((doc) => {
                feedbacks.push({ docId: doc.id, ...doc.data() }); // Store docId for verification
            });

            // Client-side Sort (Current User First, then Newest)
            feedbacks.sort((a, b) => {
                if (currentUser) {
                    if (a.userId === currentUser.uid && b.userId !== currentUser.uid) return -1;
                    if (b.userId === currentUser.uid && a.userId !== currentUser.uid) return 1;
                }
                const dateA = a.createdAt ? a.createdAt.seconds : 0;
                const dateB = b.createdAt ? b.createdAt.seconds : 0;
                return dateB - dateA;
            });

            // Calculate Average Rating
            const totalRating = feedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0);
            const averageRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 0;
            
            // Render Average on Feedbacks Page
            const pageRatingContainer = document.getElementById("pageAverageRating");
            if (pageRatingContainer) {
                pageRatingContainer.innerHTML = `
                    <div class="bg-white px-4 py-2 rounded-pill shadow-sm border border-warning d-inline-flex align-items-center">
                        <span class="display-6 fw-bold text-dark me-2">${averageRating}</span>
                        <div class="text-warning me-3">
                            ${generateStars(Math.round(averageRating))}
                        </div>
                        <span class="text-muted border-start ps-3 small">${feedbacks.length} Reviews</span>
                    </div>
                `;
            }

            let html = "";
            feedbacks.forEach((data) => {
                const stars = generateStars(data.rating);
                // Handle different date formats (some might be strings from manual entry, most are Timestamps)
                let date = 'Recent';
                if (data.createdAt && data.createdAt.seconds) {
                    date = new Date(data.createdAt.seconds * 1000).toLocaleDateString();
                }

                const dataId = data.id || ''; // Need ID for verification

                // Badges
                let badgesHtml = '';
                // Doctor Badge
                if (data.userRole === 'doctor') {
                    badgesHtml += `<span class="badge bg-primary me-1"><i class="bi bi-person-fill-add me-1"></i>Doctor</span>`;
                }
                // Verified Badge
                if (data.verified) {
                    badgesHtml += `<span class="badge bg-success mb-2"><i class="bi bi-check-circle-fill me-1"></i>Doctor Verified</span>`;
                }

                // Verify Button (Only for Doctors viewing Patient feedback)
                let verifyBtn = '';
                if (currentUser && currentUser.role === 'doctor' && data.userRole !== 'doctor' && !data.verified) {
                     verifyBtn = `
                        <button class="btn btn-sm btn-outline-success rounded-pill mt-3 w-100" onclick="verifyFeedback('${data.docId}')">
                            <i class="bi bi-patch-check me-1"></i> Verify Feedback
                        </button>
                     `;
                }

                // Delete Button (Admins OR Feedback Owner)
                let deleteBtn = '';
                if (currentUser && (currentUser.role === 'admin' || currentUser.uid === data.userId)) {
                    deleteBtn = `
                        <button class="btn btn-sm btn-outline-danger rounded-pill mt-2 w-100" onclick="deleteFeedback('${data.docId}', '${data.userId}')">
                            <i class="bi bi-trash me-1"></i> Delete Feedback
                        </button>
                    `;
                }
                
                html += `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card h-100 border-0 shadow-sm rounded-4">
                            <div class="card-body p-4 d-flex flex-column">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="avatar-initial rounded-circle bg-light text-primary d-flex align-items-center justify-content-center me-3 fw-bold" style="width: 50px; height: 50px; font-size: 1.2rem;">
                                        ${data.name ? data.name.charAt(0).toUpperCase() : 'A'}
                                    </div>
                                    <div>
                                        <h6 class="mb-0 fw-bold">
                                            ${data.name || 'Anonymous'} 
                                            <small class="text-muted fw-normal">${data.userSpecialization ? `(${data.userSpecialization})` : ''}</small>
                                        </h6>
                                        <small class="text-muted">${date}</small>
                                    </div>
                                </div>
                                <div class="mb-2">
                                    ${badgesHtml}
                                </div>
                                <div class="mb-2 text-warning">
                                    ${stars}
                                </div>
                                <p class="card-text text-secondary fst-italic">"${data.message}"</p>
                                <div class="mt-auto">
                                    ${verifyBtn}
                                    ${deleteBtn}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            listContainer.innerHTML = html;
        })
        .catch((error) => {
            console.error("Error loading feedbacks:", error);
            if (loader) loader.classList.add('d-none');
            
            let msg = "Error loading feedbacks. Please try again later.";
            if (error.code === 'permission-denied') {
                msg = "Access restricted. Firestore Security Rules may be blocking public access. Please update rules to 'allow read: if true;' for the feedback collection.";
            }
            
            listContainer.innerHTML = `<div class="col-12 text-center text-danger"><p>${msg}</p><small class="text-muted">${error.message}</small></div>`;
        });
}

// Verify Feedback Function
// Verify Feedback Function
window.verifyFeedback = function(id) {
    if (!currentUser || currentUser.role !== 'doctor') return;
    
    showConfirm("Verify Feedback", "Verify this patient feedback? This will add a 'Verified' badge.", () => {
        db.collection("feedback").doc(id).update({
            verified: true,
            verifiedBy: currentUser.uid,
            verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            showToast("Feedback verified!", "success");
            loadFeedbacks();
        }).catch(err => {
            console.error("Error verifying:", err);
            showToast("Error verifying feedback.", "danger");
        });
    });
}

// Delete Feedback Function
window.deleteFeedback = function(id, ownerId) {
    if (!currentUser) return;
    
    // Allow if Admin OR if Current User is the Owner
    if (currentUser.role !== 'admin' && currentUser.uid !== ownerId) {
        showToast("You do not have permission to delete this feedback.", "danger");
        return;
    }

    showConfirm("Delete Feedback", "Are you sure you want to delete this feedback? This cannot be undone.", () => {
        db.collection("feedback").doc(id).delete().then(() => {
            showToast("Feedback deleted.", "success");
            checkExistingFeedback(); // Refresh form availability
            loadFeedbacks();
            loadAverageRating();
        }).catch(err => {
            console.error("Error deleting feedback:", err);
            showToast("Error deleting feedback.", "danger");
        });
    });
}

// Load Average Rating for Home Page (and anywhere else)
window.loadAverageRating = function() {
    // Check if element exists to avoid unnecessary calls
    const homeContainer = document.getElementById("homeAverageRating");
    if (!homeContainer) return;

    db.collection("feedback").get().then(snapshot => {
        let total = 0;
        let count = 0;
        snapshot.forEach(doc => {
            total += (doc.data().rating || 0);
            count++;
        });
        
        const avg = count > 0 ? (total / count).toFixed(1) : 0;
        
        homeContainer.innerHTML = `
            <div class="d-inline-flex align-items-center bg-light px-3 py-2 rounded-pill mb-2">
                <span class="fw-bold text-dark me-2 display-6" style="font-size: 1.5rem">${avg}</span>
                <div class="text-warning me-2" style="font-size: 1rem">
                    ${generateStars(Math.round(avg))}
                </div>
                <small class="text-muted">(${count} verified reviews)</small>
            </div>
        `;
    }).catch(err => console.log("Error loading avg:", err));
}

// Initial Call
document.addEventListener("DOMContentLoaded", () => {
    loadAverageRating();
});

function generateStars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHtml += '<i class="bi bi-star-fill"></i> ';
        } else {
            starsHtml += '<i class="bi bi-star"></i> '; // Empty star
        }
    }
    return starsHtml;
}


// Load Doctors for Booking Dropdown
function loadDoctors() {
    const doctorSelect = document.getElementById("doctorName");
    if (!doctorSelect) return;

    db.collection("users")
        .where("role", "==", "doctor")
        .get()
        .then((querySnapshot) => {
            const options = ['<option value="" selected disabled>Select a Specialist</option>'];
            querySnapshot.forEach((doc) => {
                const doctor = doc.data();
                let label = doctor.name;
                if (doctor.specialization) {
                    label += ` (${doctor.specialization})`;
                }
                options.push(`<option value="${doctor.name}">${label}</option>`);
            });
            doctorSelect.innerHTML = options.join('');
        })
        .catch((error) => {
            console.error("Error loading doctors:", error);
        });
}

// --- About Us Page Stats Sync ---
async function loadAboutStats() {
    const statPatients = document.getElementById("statPatients");
    const statDoctors = document.getElementById("statDoctors");
    const statRating = document.getElementById("statRating");

    if (!statPatients && !statDoctors && !statRating) return;

    try {
        // 1. Count Patients
        const patientsSnapshot = await db.collection("users").where("role", "==", "patient").get();
        if (statPatients) statPatients.textContent = patientsSnapshot.size;

        // 2. Count Doctors
        const doctorsSnapshot = await db.collection("users").where("role", "==", "doctor").get();
        if (statDoctors) statDoctors.textContent = doctorsSnapshot.size;

        // 3. Average Rating
        const feedbackSnapshot = await db.collection("feedback").get();
        let totalRating = 0;
        let count = 0;
        feedbackSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.rating) {
                totalRating += data.rating;
                count++;
            }
        });
        const avg = count > 0 ? (totalRating / count).toFixed(1) : "0.0";
        if (statRating) statRating.textContent = avg;

    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAboutStats();
    setupPasswordToggles();
    setupPhoneValidation();

    // Check for Ban Message
    if (localStorage.getItem('healthSphere_banned_msg') === 'true') {
        localStorage.removeItem('healthSphere_banned_msg');
        showModal(
            "🚫 Account Suspended", 
            `<div class="text-center">
                <h4 class="text-danger fw-bold mb-3">ACCESS DENIED</h4>
                <p class="lead">Your account has been banned by the administrator.</p>
                <hr>
                <p class="mb-0">To request an unban, please contact:</p>
                <a href="mailto:admin@healthsphere.com" class="btn btn-danger btn-lg mt-3 rounded-pill shadow-sm">
                    <i class="bi bi-envelope-fill me-2"></i>admin@healthsphere.com
                </a>
            </div>`
        );
    }
});

// --- Password Visibility Toggles ---
function setupPasswordToggles() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.toggle-password')) {
            const btn = e.target.closest('.toggle-password');
            const input = btn.previousElementSibling;
            if (input && input.tagName === 'INPUT') {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.classList.toggle('bi-eye');
                    icon.classList.toggle('bi-eye-slash');
                }
            }
        }
    });
}

// --- Phone Number Validation & Formatting ---
function setupPhoneValidation() {
    const countrySelect = document.getElementById('signupCountry');
    const phoneInput = document.getElementById('signupPhone');

    if (countrySelect && phoneInput) {
        const placeholders = {
            '+1': '(555) 555-1234', // USA
            '+44': '7911 123456',   // UK
            '+91': '9876543210',    // India
            '+61': '412 345 678',   // Australia
            '+81': '90 1234 5678'   // Japan
        };

        const maxLengths = {
            '+91': 10 // Strict for India
        };

        function updatePlaceholder() {
            const code = countrySelect.value;
            phoneInput.placeholder = placeholders[code] || 'Phone Number';
            
            // Update Max Length if strict
            if (maxLengths[code]) {
                phoneInput.setAttribute('maxLength', maxLengths[code]);
                phoneInput.setAttribute('minLength', maxLengths[code]);
            } else {
                phoneInput.removeAttribute('maxLength');
                phoneInput.removeAttribute('minLength');
            }
        }

        countrySelect.addEventListener('change', updatePlaceholder);
        
        // Initial call
        updatePlaceholder();
        
        // Enforce numeric only for India
        phoneInput.addEventListener('input', function(e) {
             if (countrySelect.value === '+91') {
                 this.value = this.value.replace(/[^0-9]/g, '');
             }
        });
    }
}

// --- Change Password Form Logic ---
const changePasswordForm = document.getElementById('changePasswordForm');
if (changePasswordForm) {
    // Strength Meter for New Password
    const newPassInput = document.getElementById('newPassword');
    const strengthBar = document.getElementById('newPasswordStrengthBar');
    const strengthText = document.getElementById('newPasswordStrengthText');

    if (newPassInput) {
        newPassInput.addEventListener("input", () => {
             const val = newPassInput.value;
             let strength = 0;
             if (val.length >= 6) strength += 20;
             if (val.match(/[A-Z]/)) strength += 20;
             if (val.match(/[0-9]/)) strength += 30;
             if (val.match(/[!@#$%^&*(),.?":{}|<>]/)) strength += 30;

             if (strengthBar) {
                 strengthBar.style.width = strength + "%";
                 if (strength < 50) {
                     strengthBar.className = "progress-bar bg-danger";
                     if (strengthText) strengthText.innerText = "Weak";
                 } else if (strength < 80) {
                     strengthBar.className = "progress-bar bg-warning";
                     if (strengthText) strengthText.innerText = "Medium";
                 } else {
                     strengthBar.className = "progress-bar bg-success";
                     if (strengthText) strengthText.innerText = "Strong";
                 }
             }
        });
    }

    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmNew = document.getElementById('confirmNewPassword').value;

        if (newPassword !== confirmNew) {
            showToast("Passwords do not match!", "warning");
            return;
        }

        // Regex Validation
        const passwordRegex = /(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/;
        if (!passwordRegex.test(newPassword)) {
             showModal("Weak Password", "Password must contain at least one number and one symbol.");
             return;
        }

        // Update
        const btn = changePasswordForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = "Updating...";

        const user = firebase.auth().currentUser;
        if(user){
            user.updatePassword(newPassword).then(() => {
                showToast("Password updated successfully!", "success");
                bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
                changePasswordForm.reset();
            }).catch((error) => {
                 if (error.code === 'auth/requires-recent-login') {
                    showModal("Security Alert", "For security, please logout and login again to change your password.");
                } else {
                    console.error("Error updating password:", error);
                    showModal("Error", error.message);
                }
            }).finally(() => {
                btn.disabled = false;
                btn.textContent = "Update Password";
            });
        }
    });
}
