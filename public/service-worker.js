self.addEventListener('notificationclick', event => {
    event.notification.close();
    // Optionally, handle clicks on notifications here
});

self.addEventListener('push', event => {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: data.icon,
    };
    self.registration.showNotification(data.title, options);
});
