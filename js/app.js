/* =========================
   HELPERS GENERALES
========================= */

function getUsers() {
    return JSON.parse(localStorage.getItem("sportclub_users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("sportclub_users", JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("sportclub_current_user"));
}

function saveCurrentUser(user) {
    localStorage.setItem("sportclub_current_user", JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem("sportclub_current_user");
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

function getInitials(name) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0].toUpperCase())
        .join("");
}

function getRoleProfileKey(role) {
    return `sportclub_profile_${role}`;
}

/* =========================
   LOGIN
========================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value.trim();

        const users = getUsers();

        const foundUser = users.find(
            user => user.email.toLowerCase() === email && user.password === password
        );

        if (!foundUser) {
            alert("Correo o contraseña incorrectos.");
            return;
        }

        saveCurrentUser(foundUser);

        if (foundUser.role === "admin") {
            window.location.href = "./dashboards/admin.html";
        } else if (foundUser.role === "coach") {
            window.location.href = "./dashboards/coach.html";
        } else {
            window.location.href = "./dashboards/usuario.html";
        }
    });
}

/* =========================
   REGISTRO
========================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("correoRegistro").value.trim();
        const password = document.getElementById("passwordRegistro").value.trim();
        const confirmPassword = document.getElementById("confirmPasswordRegistro").value.trim();
        const role = document.getElementById("rol").value;
        const interes = document.getElementById("tipoDeporte").value.trim() || "Sin especificar";
        const nivel = document.getElementById("nivel").value || "Principiante";

        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        const users = getUsers();

        const exists = users.some(user => user.email.toLowerCase() === email.toLowerCase());

        if (exists) {
            alert("Ese correo ya está registrado.");
            return;
        }

        const newUser = {
            nombre,
            email,
            password,
            role,
            interes,
            nivel
        };

        users.push(newUser);
        saveUsers(users);

        document.getElementById("registerMessage")?.classList.remove("hidden");
        registerForm.reset();
    });
}

/* =========================
   RECUPERAR
========================= */

const recoverForm = document.getElementById("recoverForm");
if (recoverForm) {
    recoverForm.addEventListener("submit", function (e) {
        e.preventDefault();
        document.getElementById("recoverMessage")?.classList.remove("hidden");
    });
}

/* =========================
   LOGOUT
========================= */

function logout() {
    clearCurrentUser();
    window.location.href = "../login.html";
}

/* =========================
   PERFILES EDITABLES
========================= */

const defaultProfiles = {
    usuario: {
        nombre: "Juan Pérez",
        correo: "usuario@sportclub.com",
        interes: "Crossfit y Funcional",
        nivel: "Intermedio"
    },
    coach: {
        nombre: "María Contreras",
        correo: "coach@sportclub.com",
        interes: "Entrenamiento funcional",
        nivel: "Coach Senior"
    },
    admin: {
        nombre: "Claudio Herrera",
        correo: "admin@sportclub.com",
        interes: "Gestión del sistema",
        nivel: "Administrador general"
    }
};

function getSavedRoleProfile(role) {
    const saved = localStorage.getItem(getRoleProfileKey(role));
    return saved ? JSON.parse(saved) : null;
}

function saveRoleProfile(role, data) {
    localStorage.setItem(getRoleProfileKey(role), JSON.stringify(data));
}

function getProfile(role) {
    const currentUser = getCurrentUser();
    const savedRoleProfile = getSavedRoleProfile(role);

    if (currentUser && currentUser.role === role) {
        return {
            nombre: currentUser.nombre || savedRoleProfile?.nombre || defaultProfiles[role].nombre,
            correo: currentUser.email || savedRoleProfile?.correo || defaultProfiles[role].correo,
            interes: currentUser.interes || savedRoleProfile?.interes || defaultProfiles[role].interes,
            nivel: currentUser.nivel || savedRoleProfile?.nivel || defaultProfiles[role].nivel
        };
    }

    if (savedRoleProfile) {
        return savedRoleProfile;
    }

    return defaultProfiles[role];
}

function fillProfile(role) {
    const data = getProfile(role);

    const nameEl = document.querySelector("[data-profile-name]");
    const emailEl = document.querySelector("[data-profile-email]");
    const interestEl = document.querySelector("[data-profile-interest]");
    const levelEl = document.querySelector("[data-profile-level]");
    const avatarEl = document.querySelector("[data-profile-avatar]");

    if (nameEl) nameEl.textContent = data.nombre;
    if (emailEl) emailEl.textContent = data.correo;
    if (interestEl) interestEl.textContent = data.interes;
    if (levelEl) levelEl.textContent = data.nivel;
    if (avatarEl) avatarEl.textContent = getInitials(data.nombre);
}

function openEditModal(role) {
    const modal = document.getElementById("editProfileModal");
    if (!modal) return;

    const data = getProfile(role);

    document.getElementById("editNombre").value = data.nombre;
    document.getElementById("editCorreo").value = data.correo;
    document.getElementById("editInteres").value = data.interes;
    document.getElementById("editNivel").value = data.nivel;

    modal.classList.add("show");
    modal.setAttribute("data-role", role);
}

function closeEditModal() {
    const modal = document.getElementById("editProfileModal");
    if (modal) modal.classList.remove("show");
}

function initEditProfile(role) {
    fillProfile(role);

    const form = document.getElementById("editProfileForm");
    const modal = document.getElementById("editProfileModal");

    if (!form || !modal) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const updated = {
            nombre: document.getElementById("editNombre").value.trim(),
            correo: document.getElementById("editCorreo").value.trim(),
            interes: document.getElementById("editInteres").value.trim(),
            nivel: document.getElementById("editNivel").value.trim()
        };

        /* guardar siempre por rol */
        saveRoleProfile(role, updated);

        /* si además el usuario actual coincide con ese rol, actualizar usuarios y sesión */
        const currentUser = getCurrentUser();
        const users = getUsers();

        if (currentUser && currentUser.role === role) {
            const userIndex = users.findIndex(
                user => user.email.toLowerCase() === currentUser.email.toLowerCase()
            );

            if (userIndex !== -1) {
                users[userIndex] = {
                    ...users[userIndex],
                    nombre: updated.nombre,
                    email: updated.correo,
                    interes: updated.interes,
                    nivel: updated.nivel
                };

                saveUsers(users);
                saveCurrentUser(users[userIndex]);
            } else {
                const updatedCurrentUser = {
                    ...currentUser,
                    nombre: updated.nombre,
                    email: updated.correo,
                    interes: updated.interes,
                    nivel: updated.nivel
                };
                saveCurrentUser(updatedCurrentUser);
            }
        }

        fillProfile(role);
        closeEditModal();
        showToast("Perfil actualizado correctamente.");
    });

    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            closeEditModal();
        }
    });
}

/* =========================
   OBJETIVOS EDITABLES
========================= */

const defaultGoals = {
    goal1: {
        title: "Bajar porcentaje de grasa",
        status: "Cumpliendo",
        desc: "Mantener constancia en cardio y alimentación equilibrada durante el mes."
    },
    goal2: {
        title: "Mejorar resistencia cardiovascular",
        status: "Activo",
        desc: "Asistir a spinning y funcional para aumentar rendimiento físico."
    },
    goal3: {
        title: "Aumentar fuerza funcional",
        status: "Prioridad alta",
        desc: "Trabajar fuerza con ejercicios compuestos y seguimiento semanal."
    }
};

function getGoalsStorageKey() {
    const currentUser = getCurrentUser();
    return currentUser ? `sportclub_goals_${currentUser.email.toLowerCase()}` : "sportclub_usuario_goals";
}

function getGoals() {
    const saved = localStorage.getItem(getGoalsStorageKey());
    return saved ? JSON.parse(saved) : defaultGoals;
}

function saveGoals(data) {
    localStorage.setItem(getGoalsStorageKey(), JSON.stringify(data));
}

function getStatusClass(status) {
    const normalized = status.toLowerCase().trim();

    if (normalized === "activo") return "activo";
    if (normalized === "pendiente") return "pendiente";
    if (normalized === "cumpliendo") return "cumpliendo";
    if (normalized === "prioridad alta") return "prioridad-alta";

    return "";
}

function applyGoalStatus(element, status) {
    if (!element) return;

    element.textContent = status;
    element.className = "goal-status " + getStatusClass(status);
}

function renderGoals() {
    const goals = getGoals();

    const goalTitle1 = document.getElementById("goalTitle1");
    const goalDesc1 = document.getElementById("goalDesc1");
    const goalStatus1 = document.getElementById("goalStatus1");

    const goalTitle2 = document.getElementById("goalTitle2");
    const goalDesc2 = document.getElementById("goalDesc2");
    const goalStatus2 = document.getElementById("goalStatus2");

    const goalTitle3 = document.getElementById("goalTitle3");
    const goalDesc3 = document.getElementById("goalDesc3");
    const goalStatus3 = document.getElementById("goalStatus3");

    if (!goalTitle1 || !goalDesc1 || !goalStatus1) return;

    goalTitle1.textContent = goals.goal1.title;
    goalDesc1.textContent = goals.goal1.desc;
    applyGoalStatus(goalStatus1, goals.goal1.status);

    goalTitle2.textContent = goals.goal2.title;
    goalDesc2.textContent = goals.goal2.desc;
    applyGoalStatus(goalStatus2, goals.goal2.status);

    goalTitle3.textContent = goals.goal3.title;
    goalDesc3.textContent = goals.goal3.desc;
    applyGoalStatus(goalStatus3, goals.goal3.status);
}

function openGoalsModal() {
    const modal = document.getElementById("goalsModal");
    if (!modal) return;

    const goals = getGoals();

    document.getElementById("goal1TitleInput").value = goals.goal1.title;
    document.getElementById("goal1StatusInput").value = goals.goal1.status;
    document.getElementById("goal1DescInput").value = goals.goal1.desc;

    document.getElementById("goal2TitleInput").value = goals.goal2.title;
    document.getElementById("goal2StatusInput").value = goals.goal2.status;
    document.getElementById("goal2DescInput").value = goals.goal2.desc;

    document.getElementById("goal3TitleInput").value = goals.goal3.title;
    document.getElementById("goal3StatusInput").value = goals.goal3.status;
    document.getElementById("goal3DescInput").value = goals.goal3.desc;

    modal.classList.add("show");
}

function closeGoalsModal() {
    const modal = document.getElementById("goalsModal");
    if (modal) modal.classList.remove("show");
}

function initGoals() {
    renderGoals();

    const form = document.getElementById("goalsForm");
    const modal = document.getElementById("goalsModal");

    if (!form || !modal) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const updatedGoals = {
            goal1: {
                title: document.getElementById("goal1TitleInput").value.trim(),
                status: document.getElementById("goal1StatusInput").value,
                desc: document.getElementById("goal1DescInput").value.trim()
            },
            goal2: {
                title: document.getElementById("goal2TitleInput").value.trim(),
                status: document.getElementById("goal2StatusInput").value,
                desc: document.getElementById("goal2DescInput").value.trim()
            },
            goal3: {
                title: document.getElementById("goal3TitleInput").value.trim(),
                status: document.getElementById("goal3StatusInput").value,
                desc: document.getElementById("goal3DescInput").value.trim()
            }
        };

        saveGoals(updatedGoals);
        renderGoals();
        closeGoalsModal();
        showToast("Objetivos actualizados correctamente.");
    });

    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            closeGoalsModal();
        }
    });
}

/* =========================
   RESERVAS
========================= */

const defaultReservations = [
    { clase: "Crossfit", dia: "Lunes", horario: "06:00 PM a 07:00 PM" },
    { clase: "Funcional", dia: "Miércoles", horario: "07:00 PM a 08:00 PM" },
    { clase: "Spinning", dia: "Viernes", horario: "05:00 PM a 06:00 PM" }
];

function getReservationsStorageKey() {
    const currentUser = getCurrentUser();
    return currentUser ? `sportclub_reservas_${currentUser.email.toLowerCase()}` : "sportclub_usuario_reservas";
}

function getReservations() {
    const saved = localStorage.getItem(getReservationsStorageKey());
    return saved ? JSON.parse(saved) : defaultReservations;
}

function saveReservations(data) {
    localStorage.setItem(getReservationsStorageKey(), JSON.stringify(data));
}

function renderReservations() {
    const reservationList = document.getElementById("reservationList");
    if (!reservationList) return;

    const reservations = getReservations();
    reservationList.innerHTML = "";

    reservations.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${item.clase}</span>
            <strong>${item.dia} · ${item.horario}</strong>
        `;
        reservationList.appendChild(li);
    });
}

function showReservationFeedback(message) {
    const feedback = document.getElementById("reservationFeedback");
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.add("show");

    setTimeout(() => {
        feedback.classList.remove("show");
    }, 2400);
}

function reserveClass(clase, dia, horario) {
    const reservations = getReservations();

    const exists = reservations.some(item =>
        item.clase === clase &&
        item.dia === dia &&
        item.horario === horario
    );

    if (exists) {
        showReservationFeedback("Esa reserva ya existe en tu lista.");
        return;
    }

    reservations.push({ clase, dia, horario });
    saveReservations(reservations);
    renderReservations();
    showReservationFeedback("Reserva hecha correctamente.");
}

function initReservations() {
    renderReservations();
}