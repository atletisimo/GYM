// app.js
const addBtn = document.getElementById('addBtn');
const dateInput = document.getElementById('date');
const exerciseInput = document.getElementById('exercise');
const setsInput = document.getElementById('sets');
const repsInput = document.getElementById('reps');

const weeklyTab = document.getElementById('weekly-tab');
const allTab = document.getElementById('all-tab');
const statsTab = document.getElementById('stats-tab');

const mainTabButtons = document.querySelectorAll('.main-tabs .tab-btn');
const dayButtons = document.querySelectorAll('.week-tabs .day-btn');
const tabContent = document.getElementById('tab-content');

// =======================
// Date utilities
// =======================
function getWeekRange() {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + 1; // Monday
    const monday = new Date(curr.setDate(first));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { monday, sunday };
}

function setDateLimits() {
    const { monday, sunday } = getWeekRange();
    dateInput.min = monday.toISOString().split('T')[0];
    dateInput.max = sunday.toISOString().split('T')[0];
}
setDateLimits();

function getDayName(dateStr) {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const d = new Date(dateStr);
    return days[d.getDay()];
}

// =======================
// Add workout
// =======================
addBtn.addEventListener('click', () => {
    const date = dateInput.value;
    const exercise = exerciseInput.value.trim();
    const sets = parseInt(setsInput.value);
    const reps = parseInt(repsInput.value);

    if (!date || !exercise || !sets || !reps) {
        alert('All fields are required!');
        return;
    }

    // Check date is in current week
    const { monday, sunday } = getWeekRange();
    const selected = new Date(date);
    if (selected < monday || selected > sunday) {
        alert('Date must be within the current week!');
        return;
    }

    addWorkout({ date, exercise, sets, reps }, () => {
        const activeDayBtn = document.querySelector('.week-tabs .day-btn.active');
        if (activeDayBtn) renderWeekly(activeDayBtn.dataset.day);
        renderAll();
        renderStats();
    });

    exerciseInput.value = '';
    setsInput.value = '';
    repsInput.value = '';
});

// =======================
// Render Weekly Tab
// =======================
function renderWeekly(dayName) {
    tabContent.innerHTML = '';
    dayButtons.forEach(b => b.classList.remove('active'));
    const btn = Array.from(dayButtons).find(b => b.dataset.day === dayName);
    if (btn) btn.classList.add('active');

    getWorkoutsByDay(dayName, dayWorkouts => {
        if (dayWorkouts.length === 0) {
            tabContent.innerHTML = '<p>No workouts yet</p>';
            return;
        }

        dayWorkouts.forEach(w => {
            const li = document.createElement('li');
            li.textContent = `${w.exercise} - ${w.sets} sets x ${w.reps} reps`;

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.textContent = '❌';
            delBtn.style.marginLeft = '10px';
            delBtn.style.cursor = 'pointer';
            delBtn.addEventListener('click', () => {
                deleteWorkout(w.id, () => {
                    renderWeekly(dayName);
                    renderAll();
                    renderStats();
                });
            });

            li.appendChild(delBtn);
            tabContent.appendChild(li);
        });
    });
}

// =======================
// Weekly Day Tabs
// =======================
dayButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        renderWeekly(btn.dataset.day);
    });
});

// Default weekly tab
dayButtons[0].classList.add('active');
renderWeekly(dayButtons[0].dataset.day);

// =======================
// Main Tabs logic
// =======================
mainTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        mainTabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        weeklyTab.style.display = 'none';
        allTab.style.display = 'none';
        statsTab.style.display = 'none';

        if (btn.dataset.tab === 'weekly') weeklyTab.style.display = 'flex';
        if (btn.dataset.tab === 'all') {
            allTab.style.display = 'flex';
            renderAll();
        }
        if (btn.dataset.tab === 'stats') {
            statsTab.style.display = 'flex';
            renderStats();
        }
    });
});

// =======================
// Render All Workouts
// =======================
function renderAll() {
    const list = document.getElementById('list');
    list.innerHTML = '';
    getAllWorkouts(workouts => {
        workouts.forEach(w => {
            const li = document.createElement('li');
            li.textContent = `${w.date} - ${w.exercise} - ${w.sets} sets x ${w.reps} reps`;

            const delBtn = document.createElement('button');
            delBtn.textContent = '❌';
            delBtn.style.marginLeft = '10px';
            delBtn.style.cursor = 'pointer';
            delBtn.addEventListener('click', () => {
                deleteWorkout(w.id, () => {
                    renderAll();
                    renderStats();
                    const activeDayBtn = document.querySelector('.week-tabs .day-btn.active');
                    if(activeDayBtn) renderWeekly(activeDayBtn.dataset.day);
                });
            });

            li.appendChild(delBtn);
            list.appendChild(li);
        });
    });
}

// =======================
// Render Stats
// =======================
function renderStats() {
    getAllWorkouts(workouts => {
        const totalWorkouts = workouts.length;
        const totalSets = workouts.reduce((sum, w) => sum + w.sets, 0);
        const totalReps = workouts.reduce((sum, w) => sum + w.reps, 0);

        document.getElementById('totalWorkouts').textContent = `Total Workouts: ${totalWorkouts}`;
        document.getElementById('totalSets').textContent = `Total Sets: ${totalSets}`;
        document.getElementById('totalReps').textContent = `Total Reps: ${totalReps}`;
    });
}

// =======================
// Initialize All / Stats Tabs
// =======================
renderAll();
renderStats();