import  PushNotificationIOS from '@react-native-community/push-notification-ios'

const showNotification = (title, summary, description) => {
    PushNotificationIOS.addNotificationRequest({
        id: new Date().toString(),
        title: title,
        body: description,
        alertAction: 'view',
    });
}

const handleCancel = () => {
    PushNotificationIOS.removeAllDeliveredNotifications();
}

export { showNotification, handleCancel };