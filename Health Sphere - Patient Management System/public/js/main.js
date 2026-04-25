// Firebase Configuration
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
    }
    if (heroAuthButtons) heroAuthButtons.classList.add("d-none");

    // Hide all dashboards first
    document.querySelectorAll('.dashboard-view').forEach(el => el.classList.add('d-none'));

    // Show specific dashboard based on role & Load Data
    if (currentUser.role === 'doctor') {
        if(doctorDashboard) doctorDashboard.classList.remove('d-none');
        loadDoctorEmbeddedSchedule();
        checkDoctorSpecialization(); // Check profile completion
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
    // but we can check if the user has a phone provider linked).
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

// Google Login
window.googleLogin = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');
    
    auth.signInWithPopup(provider).then(async (result) => {
        const user = result.user;
        let phoneNumber = user.phoneNumber;

        // If phone number is not available from Google (common), ask user
        if (!phoneNumber) {
            phoneNumber = prompt("Google didn't provide your phone number. Please enter it to complete your profile:", "");
        }

        // Check if user doc exists, if not create it
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            await db.collection('users').doc(user.uid).set({
                name: user.displayName,
                email: user.email,
                phone: phoneNumber || 'Not provided',
                countryCode: '', 
                role: 'patient', // Force Patient Role for Google Login
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        alert('Logged in with Google!');
        bootstrap.Modal.getInstance(document.getElementById('signupModal')).hide();
    }).catch((error) => {
        console.error(error);
        alert(error.message);
    });
}

// Signup Logic
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const phone = document.getElementById('signupPhone').value;
    const countryCode = document.getElementById('signupCountry').value;
    
    // RESTRICTION: Everyone signs up as a patient initially.
    // Admin must manually upgrade users or create doctors via special Admin Tool.
    const role = 'patient'; 

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password,
      );
      // Update profile with name
      await userCredential.user.updateProfile({
        displayName: name,
      });
            
            // Save user details to Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                phone: phone,
                countryCode: countryCode,
                role: role, 
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

      alert("Account created! Logging you in...");
      bootstrap.Modal.getInstance(
        document.getElementById("signupModal"),
      ).hide();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  });
}

// Login Logic
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      await auth.signInWithEmailAndPassword(email, password);
      bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
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

  // Check Availability on change
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

      db.collection("appointments")
          .where("doctorName", "==", doctor)
          .where("date", "==", date)
          .get()
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

              // Disable booked slots
              let availableCount = 0;
              Array.from(timeSelect.options).forEach(option => {
                  if (bookedTimes.includes(option.value)) {
                      option.disabled = true;
                      option.text += " (Booked)";
                  } else if (option.value) {
                      availableCount++;
                  }
              });

              if (availableCount === 0) {
                  timeSelect.innerHTML = '<option value="" selected disabled>Fully Booked</option>';
                  alert('This date is fully booked for the selected doctor. Please choose another date.');
              } else {
                  timeSelect.disabled = false;
              }
          })
          .catch((error) => {
              console.error("Error checking availability: ", error);
              timeSelect.innerHTML = '<option value="" selected disabled>Error loading slots</option>';
          });
  }

  doctorSelect.addEventListener('change', checkAvailability);
  dateInput.addEventListener('change', checkAvailability);

  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please login to book an appointment");
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
        alert("Sorry, this slot was just booked by someone else. Please choose another time.");
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
      alert("Appointment Booked Successfully!");
      bookingForm.reset();
      timeSelect.disabled = true; // Reset time select
      timeSelect.innerHTML = '<option value="" selected disabled>Select Date First</option>';
      
      bootstrap.Modal.getInstance(
        document.getElementById("bookingModal"),
      ).hide();
      loadPatientAppointments(); // Refresh patient view
    } catch (error) {
      console.error("Error:", error);
      alert("Error booking appointment.");
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
            alert("Appointment updated successfully!");
            bootstrap.Modal.getInstance(document.getElementById('editAppointmentModal')).hide();
            submitBtn.textContent = 'Save Changes';
            submitBtn.disabled = false;
        }).catch((error) => {
            console.error("Error updating appointment:", error);
            alert("Error updating appointment.");
            submitBtn.textContent = 'Save Changes';
            submitBtn.disabled = false;
        });
    });
}

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

// Load Appointments for Standalone Doctor Dashboard (dashboard.html)
// Load Appointments for Doctor Dashboard (Embedded in Index)
// Load Appointments for Standalone Doctor Dashboard (dashboard.html)
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
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="avatar-initial rounded-circle bg-light text-primary me-3 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                    ${appt.patientName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h6 class="mb-0 fw-bold">${appt.patientName}</h6>
                                </div>
                            </div>
                        </td>
                        <td>${appt.patientEmail || '<span class="text-muted">-</span>'}</td>
                        <td>${appt.patientPhone || '<span class="text-muted">-</span>'}</td>
                        <td><span class="badge bg-info text-dark">${appt.doctorName}</span></td>
                        <td>
                            <div class="d-flex flex-column">
                                <span class="fw-bold">${appt.date}</span>
                                <small class="text-muted">${appt.time}</small>
                            </div>
                        </td>
                        <td>${appt.reason}</td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-success rounded-pill px-3" onclick="completeAppointment('${appt.id}')">
                                <i class="bi bi-check-lg me-1"></i> Done
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }, (error) => {
            console.error("Error loading dashboard appointments:", error);
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger p-4">Error loading data.</td></tr>';
        });
}

// Complete Appointment (Doctor Action)
// Complete Appointment (Doctor Action)
window.completeAppointment = function(id) {
     showConfirmModal("Complete Appointment", "Mark this appointment as completed?", function() {
        db.collection("appointments").doc(id).update({
            status: 'completed'
        }).then(() => {
             // loadDoctorDashboard will auto-refresh due to onSnapshot
             setTimeout(() => alert("Appointment marked as completed."), 300);
        }).catch(err => {
             console.error("Error completing appointment:", err);
             alert("Error updating appointment.");
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

    showConfirmModal(title, msg, function() {
        // 1. Admin: Hard Delete
        if (currentUser.role === 'admin') {
            db.collection("appointments").doc(id).delete()
            .then(() => {
                // UI auto-updates
            }).catch(err => {
                console.error("Error deleting:", err);
                alert("Error deleting appointment.");
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
        }).catch(err => {
             console.error("Error removing from history:", err);
             alert("Error updating history.");
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
            
            alert("Profile updated successfully!");
            bootstrap.Modal.getInstance(document.getElementById('doctorProfileModal')).hide();
            
            // Re-render auth UI to reflect changes if needed
            // (Optional)
        }).catch((error) => {
            console.error("Error updating profile:", error);
            alert("Error updating profile: " + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save & Continue';
        });
    });
}

// Load Appointments for Doctor Dashboard (Standalone Page)
function loadAppointments() {
  const tableBody = document.getElementById("appointmentsTableBody");
  if (!tableBody || !currentUser) return;

  tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Loading...</td></tr>';

  const today = new Date().toISOString().split('T')[0];

  db.collection("appointments")
    .where("doctorName", "==", currentUser.name)
    .onSnapshot((querySnapshot) => {
        const appointments = [];
        querySnapshot.forEach((doc) => {
             const data = doc.data();
             // Note: We intentionally include hiddenForDoctor items here if they match filters, 
             // but we'll render them differently below or filter them out if they are truly not needed.
             // The user requested showing "Time slot booked" even if deleted.
             // However, "loadAppointments" is usually "Upcoming".
             // If a user "Deleted from history", it's in history / completed.
             // "Upcoming" shouldn't usually have "Deleted from history" items unless logic overlaps.
             // But if we want to show BLOCKED slots:
             
             if (data.hiddenForDoctor) {
                 // If it's upcoming (unlikely for history delete, but possible if manual status change), 
                 // we track it but might render specialized row.
                 // For now, let's exclude purely hidden items from the MAIN table to keep it clean, 
                 // UNLESS the user explicitly wants them.
                 // But the prompt says "it should show to that specific doctor".
                 // Let's assume this applies primarily to the History view where they deleted it.
                 // For "Upcoming", if I delete it, do I want to see it?
                 // Let's stick to the History view implementation above as the primary fix.
                 // But wait, if I am checking for "Booked Slots", maybe I need to see even upcoming hidden ones?
                 // Let's allow them but mark them.
             } else {
                 // Normal check
             }

             // Filter: Only show upcoming AND not completed
             // If hidden, we still check date.
             if (data.date >= today && data.status !== 'completed') {
                 // For dashboard, if it is hidden, we skip it to avoid clutter for UPCOMING.
                 // The "Delete" button is only in History.
                 // So we shouldn't have hidden items here unless we add delete to upcoming.
                 // So we can keep the filter:
                 if (!data.hiddenForDoctor) {
                    appointments.push({ id: doc.id, ...data });
                 }
             }
        });

        if (appointments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No upcoming appointments found.</td></tr>';
            return;
        }

        // Sort by date/time
        appointments.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

        tableBody.innerHTML = appointments.map(appt => `
            <tr>
                <td class="p-4 fw-bold text-dark">${appt.patientName}</td>
                <td class="p-4 text-muted">${appt.patientEmail || '-'}</td>
                <td class="p-4 text-muted">${appt.patientPhone || '-'}</td>
                <td class="p-4"><span class="badge bg-primary-subtle text-primary rounded-pill px-3">Dr. ${appt.doctorName}</span></td>
                <td class="p-4">
                    <div class="d-flex flex-column">
                        <span class="fw-bold text-dark">${appt.date}</span>
                        <span class="small text-muted">${appt.time}</span>
                    </div>
                </td>
                <td class="p-4 text-muted" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${appt.reason}</td>
                <td class="p-4 text-end">
                    <button class="btn btn-success btn-sm rounded-pill px-3 shadow-sm" onclick="completeAppointment('${appt.id}')">
                        <i class="bi bi-check-lg me-1"></i> Done
                    </button>
                    <!-- <button class="btn btn-outline-danger btn-sm rounded-pill px-3 ms-1 shadow-sm"><i class="bi bi-x-lg"></i></button> -->
                </td>
            </tr>
        `).join("");

        // Also check specialization here just in case logic flow missed it
        checkDoctorSpecialization(); 

    }, (error) => {
        console.error("Error loading appointments:", error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-danger">Error loading data.</td></tr>';
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

// Delete Appointment
window.deleteAppointment = function(id) {
    showConfirmModal("Cancel Appointment", "Are you sure you want to cancel this appointment?", function() {
        console.log("Attempting to delete appointment:", id);

        db.collection("appointments")
            .doc(id)
            .delete()
            .then(() => {
                console.log("Document successfully deleted!");
                // Refresh logic
                if (window.location.pathname.includes('admin')) {
                    loadAdminData();
                } else {
                    loadAppointments(); 
                }
                // Use a small timeout for the alert to avoid conflict with modal closing
                setTimeout(() => alert("Appointment deleted successfully."), 300);
            })
            .catch((error) => {
                console.error("Error removing document: ", error);
                alert("Error deleting appointment: " + error.message);
            });
    });
}

// Delete User
window.deleteUser = function(id) {
    showConfirmModal("Delete User", "Are you sure you want to delete this user? This action cannot be undone.", function() {
        db.collection("users").doc(id).delete().then(() => {
            loadAdminData();
             setTimeout(() => alert("User record deleted from database."), 300);
        }).catch((error) => {
            console.error("Error removing user: ", error);
            alert("Error deleting user: " + error.message);
        });
    });
}

// Promote to Doctor
window.promoteToDoctor = function(id, name) {
    showConfirmModal("Promote User", `Are you sure you want to promote ${name} to a Doctor?`, function() {
        db.collection("users").doc(id).update({
            role: 'doctor'
        }).then(() => {
            loadAdminData();
            setTimeout(() => alert(`${name} is now a Doctor!`), 300);
        }).catch((error) => {
            console.error("Error promoting user: ", error);
            alert("Error promoting user: " + error.message);
        });
    });
}

// Demote to Patient
window.demoteToPatient = function(id, name) {
    showConfirmModal("Demote User", `Are you sure you want to demote ${name} to a Patient? They will no longer have access to the doctor dashboard.`, function() {
        db.collection("users").doc(id).update({
            role: 'patient'
        }).then(() => {
            loadAdminData();
            setTimeout(() => alert(`${name} is now a Patient.`), 300);
        }).catch((error) => {
            console.error("Error demoting user: ", error);
            alert("Error demoting user: " + error.message);
        });
    });
}

// Search Filter Function
window.filterAdminTable = function(inputId, tableId) {
    const input = document.getElementById(inputId);
    const filter = input.value.toLowerCase();
    const table = document.getElementById(tableId);
    if (!table) return;
    const tr = table.getElementsByTagName("tr");

    for (let i = 0; i < tr.length; i++) {
        const tdName = tr[i].getElementsByTagName("td")[0];
        const tdEmail = tr[i].getElementsByTagName("td")[1];
        const tdPhone = tr[i].getElementsByTagName("td")[3];
        
        if (tdName || tdEmail || tdPhone) {
            const txtName = tdName.textContent || tdName.innerText;
            const txtEmail = tdEmail.textContent || tdEmail.innerText;
            const txtPhone = tdPhone.textContent || tdPhone.innerText;

            if (txtName.toLowerCase().indexOf(filter) > -1 || 
                txtEmail.toLowerCase().indexOf(filter) > -1 ||
                txtPhone.toLowerCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }       
    }
}

// Load Admin Data
function loadAdminData() {
    if (!currentUser || currentUser.role !== 'admin') return;

    // Table Bodies
    const allUsersBody = document.getElementById("adminUsersTableBody");
    const doctorsBody = document.getElementById("adminDoctorsTableBody");
    const patientsBody = document.getElementById("adminPatientsTableBody");

    const setLoader = (el) => { if(el) el.innerHTML = '<tr><td colspan="5" class="text-center p-4">Loading...</td></tr>'; }
    setLoader(allUsersBody);
    setLoader(doctorsBody);
    setLoader(patientsBody);

    db.collection("users").get().then((querySnapshot) => {
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });

        // Filter Lists
        const doctors = users.filter(u => u.role === 'doctor');
        const patients = users.filter(u => u.role === 'patient');

        // Render Function
        const renderRows = (data, container) => {
            if (!container) return;
            if (data.length === 0) {
                container.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-muted">No records found.</td></tr>';
                return;
            }
            container.innerHTML = data.map(user => `
                <tr>
                    <td class="p-4 fw-bold">${user.name || 'N/A'}</td>
                    <td class="p-4 small">${user.email}</td>
                    <td class="p-4"><span class="badge ${user.role === 'doctor' ? 'bg-success' : (user.role === 'admin' ? 'bg-danger' : 'bg-secondary')}">${user.role || 'patient'}</span></td>
                    <td class="p-4 small">${user.phone || '-'}</td>
                    <td class="p-4 text-end">
                        ${user.role === 'patient' ? 
                            `<button class="btn btn-sm btn-outline-primary me-2" onclick="promoteToDoctor('${user.id}', '${user.name}')" title="Promote to Doctor"><i class="bi bi-person-up"></i> Promote</button>` : 
                            (user.role === 'doctor' ? 
                            `<button class="btn btn-sm btn-outline-warning me-2" onclick="demoteToPatient('${user.id}', '${user.name}')" title="Demote to Patient"><i class="bi bi-person-down"></i> Demote</button>` : '')
                        }
                        ${user.role !== 'admin' ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${user.id}')" title="Delete User"><i class="bi bi-trash"></i></button>` : ''}
                    </td>
                </tr>
            `).join('');
        };

        // Render All Tabs
        renderRows(users, allUsersBody);
        renderRows(doctors, doctorsBody);
        renderRows(patients, patientsBody);

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

            console.log("Updating Firestore user doc...");
             await db.collection("users").doc(currentUser.uid).update({
            name: newName,
            phone: newPhone
        });
            // Update local state gently (don't nuke providerData)
            currentUser.name = newName;
            currentUser.phone = newPhone;
            
            // Render UI updates
            const userNameDisplay = document.getElementById("userNameDisplay");
            if (userNameDisplay) userNameDisplay.textContent = newName;
            
            // Success Feedback: Change button text and color
            submitBtn.textContent = 'Changes Saved!';
            submitBtn.classList.remove('btn-primary');
            submitBtn.classList.add('btn-success');
            
            // Close modal after delay so user sees the success message
            setTimeout(() => {
                const modalEl = document.getElementById('settingsModal');
                const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modalInstance.hide();
                
                // Reset button state after modal is closed
                setTimeout(() => {
                    submitBtn.textContent = 'Save Changes';
                    submitBtn.classList.remove('btn-success');
                    submitBtn.classList.add('btn-primary');
                    submitBtn.disabled = false;
                }, 500);
            }, 1500);

        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile: " + error.message);
            
            // Reset button immediately on error
            submitBtn.textContent = 'Save Changes';
            submitBtn.disabled = false;
        }
    });
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
