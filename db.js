// db.js
let db;

function openDB() {
    const request = indexedDB.open('gymDB', 1);

    request.onerror = () => console.error('DB open failed');
    request.onsuccess = () => {
        db = request.result;
        console.log('DB opened');
    };

    request.onupgradeneeded = e => {
        db = e.target.result;
        if (!db.objectStoreNames.contains('workouts')) {
            const store = db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
            store.createIndex('date', 'date', { unique: false });
        }
    };
}

openDB();

function addWorkout(workout, callback) {
    const tx = db.transaction('workouts', 'readwrite');
    const store = tx.objectStore('workouts');
    store.add(workout);

    tx.oncomplete = () => {
        console.log('Workout added');
        if(callback) callback();
    };
    tx.onerror = () => console.error('Add failed');
}

function getAllWorkouts(callback) {
    const tx = db.transaction('workouts', 'readonly');
    const store = tx.objectStore('workouts');
    const request = store.getAll();

    request.onsuccess = () => callback(request.result);
    request.onerror = () => console.error('Fetch failed');
}

function getWorkoutsByDay(dayName, callback) {
    getAllWorkouts(all => {
        const filtered = all.filter(w => {
            const d = new Date(w.date);
            const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            return days[d.getDay()] === dayName;
        });
        callback(filtered);
    });
}

function deleteWorkout(id, callback) {
    const tx = db.transaction('workouts', 'readwrite');
    const store = tx.objectStore('workouts');
    store.delete(id);

    tx.oncomplete = () => {
        console.log('Workout deleted');
        if(callback) callback();
    };
    tx.onerror = () => console.error('Delete failed');
}
