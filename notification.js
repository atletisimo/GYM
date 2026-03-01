function showLocalNotification(title, body) {
    if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title, { body, icon: "slika_pwa.png" });
        });
    }
}
// Проверка дали Notifications се поддржани
if ('Notification' in window && 'serviceWorker' in navigator) {

    // Побарај permission веднаш при load
    Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
    });

    // Додај EventListener за копчето
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('notifyBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                navigator.serviceWorker.getRegistration().then(reg => {
                    if (reg) {
                        reg.showNotification('Workout Reminder', {
                            body: 'Time for your next set!',
                            icon: 'slika_pwa.png'
                        });
                    } else {
                        console.warn('Service Worker not registered yet!');
                    }
                });
            });
        }
    });

}