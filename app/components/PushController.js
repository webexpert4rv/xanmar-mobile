import React, { Component } from "react";
import { Platform } from 'react-native';
import FCM, { FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType } from 'react-native-fcm';
import format from 'string-format';
import constants from '../constants/c';
import realm from './realm';
import * as events from '../broadcast/events';

export default class PushController extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    FCM.requestPermissions();

    if (!this.hasTokenSet()) {
      FCM.getFCMToken().then(token => {
        console.log("TOKEN (getFCMToken)", token);
        this.postDeviceToken(token);
        // this.props.onChangeToken(token);
      });
    }

    FCM.getInitialNotification().then(notif => {
      console.log("INITIAL NOTIFICATION", notif);
    });

    this.notificationListner = FCM.on(FCMEvent.Notification, (notif) => {
      console.log("Notification", notif);
      console.log(JSON.stringify(notif));
      // if (notif.evt === 'job') {
      //   events.sendMerchantJobChangeEvent(true);
      // }
      if (notif.evt === 'merchantBid') {
        console.log('Got merchant bid...');
        events.sendSvcRequestBidEvent(true);
        //this.props.onNotificationReceived(notif);
      }
      if (notif.evt === 'bidAccepted' || notif.evt === 'job' || notif.evt === 'jobClosed') {
        events.sendMerchantJobChangeEvent(true);
      }
      if (notif.local_notification) {
        return;
      }
      if (notif.opened_from_tray) {
        return;
      }

      if (Platform.OS ==='ios') {
              //optional
              //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
              //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
              //notif._notificationType is available for iOS platfrom
              switch(notif._notificationType){
                case NotificationType.Remote:
                  notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
                  break;
                case NotificationType.NotificationResponse:
                  notif.finish();
                  break;
                case NotificationType.WillPresent:
                  notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
                  break;
              }
            }
      this.showLocalNotification(notif);
    });

    this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, (token) => {
      console.log("TOKEN (refreshUnsubscribe)", token);
      // this.props.onChangeToken(token);
      this.postDeviceToken(token);
    });
  }

  showLocalNotification(notif) {
    FCM.presentLocalNotification({
      title: notif.title,
      body: notif.body,
      priority: "high",
      click_action: notif.click_action,
      show_in_foreground: true,
      local: true
    });
  }

  updateLocalToken(token) {
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      realm.write(() => {
        userPrefs[0].deviceToken = token;
      });
    }
  }

  hasTokenSet() {
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      if (userPrefs[0].deviceToken !== '') {
        return true;
      } else {
        return false;
      }
    }
  }

  getUserId() {
    let uId = 0;
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      uId = userPrefs[0].userId;
    }
    return uId;
  }

  postDeviceToken(token) {
    this.updateLocalToken(token);
    const userPrefs = realm.objects('UserPreference');
    let r = '';
    if (userPrefs.length > 0) {
      if (userPrefs[0].role === 'consumer') {
        r = 'consumer';
      } else {
        r = 'merchant';
      }
    }
    fetch(format('{}/api/user/token', constants.BASSE_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: constants.API_KEY,
      },
      body: JSON.stringify({
        user_id: this.getUserId(),
        dt: token,
        role: r
      }),
    })
      .then(response => response.json())
      .then((responseData) => {
        // do i need to do anything here
      })
      .done();
  }
  componentWillUnmount() {
    this.notificationListner.remove();
    this.refreshTokenListener.remove();
  }


  render() {
    return null;
  }
}
