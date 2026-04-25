// Load Appointments for Standalone Doctor Dashboard (dashboard.html)
function loadAppointments() {
    const tableBody = document.getElementById("appointmentsTableBody");
    if (!tableBody) return;
    
    // Ensure user is logged in and is a doctor
    if (!currentUser || currentUser.role !== 'doctor') return;

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
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-muted">No upcoming appointments found.</td></tr>';
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
