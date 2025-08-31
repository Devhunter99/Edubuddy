
let timerId = null;
let timeRemaining = 0;
let isActive = false;

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

self.onmessage = (event) => {
    const { command, value } = event.data;

    if (command === 'start') {
        if (!isActive) {
            isActive = true;
            timeRemaining = value.time;

            // Show initial persistent notification
            self.registration.showNotification('Study Timer is running', {
                body: `Time remaining: ${formatTime(timeRemaining)}`,
                tag: 'study-timer-notification',
                silent: true,
                renotify: false, 
            });

            timerId = setInterval(() => {
                timeRemaining--;
                self.postMessage({ type: 'tick', timeRemaining });
                
                if (timeRemaining % 5 === 0 || timeRemaining < 10) { // Update notification every 5s to save battery
                    self.registration.showNotification('Study Timer is running', {
                        body: `Time remaining: ${formatTime(timeRemaining)}`,
                        tag: 'study-timer-notification',
                        silent: true,
                        renotify: false,
                    });
                }

                if (timeRemaining <= 0) {
                    clearInterval(timerId);
                    timerId = null;
                    isActive = false;
                    self.postMessage({ type: 'done' });
                    // Close the persistent notification
                    self.registration.getNotifications({ tag: 'study-timer-notification' }).then(notifications => {
                        notifications.forEach(notification => notification.close());
                    });
                    // Show final notification
                    self.registration.showNotification('Session Complete!', {
                        body: 'Great work! Time for a break.',
                        icon: '/logo.png', // Ensure you have a logo.png in your /public folder
                    });
                }
            }, 1000);
        }
    } else if (command === 'pause') {
        if (isActive) {
            isActive = false;
            clearInterval(timerId);
            timerId = null;
            self.registration.getNotifications({ tag: 'study-timer-notification' }).then(notifications => {
                notifications.forEach(notification => notification.close());
            });
        }
    } else if (command === 'reset') {
        isActive = false;
        clearInterval(timerId);
        timerId = null;
        timeRemaining = value.duration;
        self.postMessage({ type: 'tick', timeRemaining });
        self.registration.getNotifications({ tag: 'study-timer-notification' }).then(notifications => {
            notifications.forEach(notification => notification.close());
        });
    }
};
