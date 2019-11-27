var webPush = require('web-push');
const vapidKeys = {
    "publicKey": "BBx9BYFYWalh_dGtcQbTXLQrx04Pk0Ri7E66Ql4q2flpvM0m7fq-0DBoDUcQAny0tF-ym59mfGtXepl0AeiOAK8",
    "privateKey": "uJ3mCeouDj4tl-jEgb-h5S2FYq0mUVUzaIZcyR8s8a8"
};


webPush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
)
var pushSubscription = {
    "endpoint": "https://fcm.googleapis.com/fcm/send/c8xbWYuT4EI:APA91bFiUwIC9lo1HkvbxpmabT4CdINrBuvC_u7Sa1Um5ASj3uoeA9fIlQ4yY4aVAuX1wrB8SIEBRdGJL94w8Zd-7CQHqi1BbaLgcUdnIJZe9aJk89coW3p9nQLzyMsrTXeD6daXhPTc",
    "keys": {
        "p256dh": "BMNQK4UorhTxQczlAAz1gjUu8fo7vb86S9TxP5Zq07AkoQXC2RDBf2iLHeDzSZaA0jayWFwcT8sZy1bHvdc5yco=",
        "auth": "p7Bpq12rQQFxibReLoVrBA=="
    }
};
var payload = 'Sekor Liverpool FC 3 : 1 Manchester City FC';
var options = {
    gcmAPIKey: '846914668119',
    TTL: 60
};
webPush.sendNotification(
    pushSubscription,
    payload,
    options
);