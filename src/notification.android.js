import PushNotification from 'react-native-push-notification'

const showNotification = (title, summary, description) => {
    PushNotification.localNotification({
        channelId: "not1",
        autoCancel: true,
        bigText: description,
        title,
        message: summary,
        vibrate: true,
        vibration: 300,
        playSound: true,
        soundName: "default",
    });
}

export { showNotification };