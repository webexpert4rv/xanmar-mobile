import React, { Component, Dimensions, PropTypes } from 'react';
import { AppRegistry, Button, InteractionManager,
         Image, View, StyleSheet, Platform, Text, TouchableOpacity } from 'react-native';
import { HeaderBackButton } from 'react-navigation';
import { ListView } from 'realm/react-native';
import format from 'string-format';
import { common, serviceRequest } from '../style/style';
import realm from './realm';
import palette from '../style/palette';
import constants from '../constants/c';
import df from 'dateformat';
import * as events from '../broadcast/events';
import IconBadge from 'react-native-icon-badge';

const needServiceIcon = require('../img/need_service.png');
const svcHistoryIcon = require('../img/tabbar/services_on.png');

export default class ConsumerSvcHistory extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const unread = params.badgeCount;
    return {
      title: 'Services',
      header: null,
      tabBarIcon: ({ tintColor }) =>   params.badgeCount > 0 ? (
          <IconBadge
            MainElement={<Image
              source={svcHistoryIcon}
              style={{ width: 26, height: 26, tintColor }}
            />}
            BadgeElement={<Text style={{ color: 'white' }}>{unread}</Text>}
            IconBadgeStyle={
              {position:'absolute',
                top:-1,
                right:-15,
                minWidth:20,
                height:20,
                borderRadius:15,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FF0000'}
            }
            Hidden={unread === 0}
          />
        ) : (
          <Image
                source={svcHistoryIcon}
                style={{ width: 26, height: 26, tintColor }}
              />
        ),
    };
  };

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const srs = realm.objects('ServiceRequest');
    let activeRequest = srs.filtered('status != "canceled"');
    let sortedSvcRequests = activeRequest.sorted('service_date', true)
    const currentVechicle = realm.objects('CurrentVehicle');

    this.state = {
      dataSource: ds.cloneWithRows(sortedSvcRequests),
      currentVechicle: currentVechicle[0],
    };
  }

  componentDidMount() {
    events.getSvcRequestEvents().subscribe((value) => {
      this.fetchSvcRequestFromAPI();
    });
    events.getSvcRequestBidsEvents().subscribe((value) => {
      this.fetchSvcRequestFromAPI();
    });
    this.fetchSvcRequestFromAPI();
  }

  tabClicked(srid) {
    let allNotifications = realm.objects('Notifications');
    let readNotification = allNotifications.filtered(format('service_request_id == {}', srid));
    realm.write(() => {
      readNotification.forEach(n => {
        n.acknowledged = true;
      });
    });

    let unreadNotifications = allNotifications.filtered(format('acknowledged == {}', false));
    this.props.navigation.setParams({ badgeCount: unreadNotifications.length});

    //call api to let server know that notificatons for this service request has been seen.
    fetch(format('{}/api/user/svcreq/notification', constants.BASSE_URL), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: constants.API_KEY,
      },
      body: JSON.stringify({
        service_request_id: srid,
        user_id: this.getUserId(),
      }),
    })
    .then(response => response.json())
    .then((responseData) => {
    })
    .done();
  }
  addServiceRequest() {
    this.props.navigation.navigate('RequestService', { vehicle: this.state.currentVechicle });
    // this.props.navigation.navigate('RequestServicePhoto');
  }

  loadSvcRequests() {
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const srs = realm.objects('ServiceRequest');
    let activeRequest = srs.filtered('status != "canceled"');
    let sortedSvcRequests = activeRequest.sorted('service_date', true)

    this.setState({
      dataSource: ds.cloneWithRows(sortedSvcRequests)
    });
  }

  getUserId() {
    let uId = 0;
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      uId = userPrefs[0].userId;
    }
    return uId;
  }

  fetchSvcRequestFromAPI(){
    fetch(format('{}/api/user/svcreq/{}', constants.BASSE_URL, this.getUserId()),{
      headers: {
        Authorization: constants.API_KEY,
      },
    })
      .then(response => response.json())
      .then((responseData) => {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.setState({
          dataSource: ds.cloneWithRows(responseData.serviceRequests),
          isLoading: false,
        });

        //update status locally and any unread notifications
        let unreadCount = 0;
        responseData.serviceRequests.forEach((serviceRequest) => {
          let svcRequest = realm.objects('ServiceRequest');
          let sr = svcRequest.filtered(format('service_id == {}', serviceRequest.service_request_id));
          realm.write(() => {
            sr[0].status = serviceRequest.status;
            serviceRequest.unread_notifications.forEach((notification) => {
              unreadCount++;
              realm.create('Notifications',
                {
                  service_request_id: serviceRequest.service_request_id,
                  notify_date: new Date(notification.notify_date),
                  notify_event: notification.notify_event,
                });
            });
          });
        });

        this.props.navigation.setParams({ badgeCount: unreadCount});

      })
      .done();
  }

  fetchData() {
    fetch(format('{}/api/user/bids/{}', constants.BASSE_URL, this.getUserId()),{
      headers: {
        Authorization: constants.API_KEY,
      },
    })
      .then(response => response.json())
      .then((responseData) => {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.setState({
          dataSource: ds.cloneWithRows(responseData.bids),
          isLoading: false,
        });
      })
      .done();
  }

  serviceRequestClick(sr) {
    this.tabClicked(sr.service_request_id);

    //refresh servie request list.
    this.loadSvcRequests();

    //this is so dumb, but only way it works, otherwiese, keeps old state of badgeCount around
    //when the user goes back.
    setTimeout( () => {
      if (sr.status === 'new' || sr.status === 'bidding') {
        this.props.navigation.navigate('ConsumerSvcRequestBids',
        {svcRequest: sr});
      }
      if (sr.status === 'in progress' || sr.status === 'completed') {
        this.props.navigation.navigate('ConsumerSvcRequestSummary', {svcRequest: sr});
      }
   },100);
  }

  renderRow(rowData, sectionID, rowID, highlightRow){
    const sd = df(rowData.service_date, 'dddd mmmm dS, yyyy');
    var status;
    var s;
    var buttonText;
    if (rowData.status === 'new') {
      s = serviceRequest.statusWaitingOnBids;
      status = 'WAITING ON BIDS';
    }
    if (rowData.status === 'bidding') {
      if (rowData.unread_notifications.length > 0) {
        s = serviceRequest.statusBidsAvailableUnread;
      } else {
        s = serviceRequest.statusBidsAvailable;
      }
      status = 'BIDS ARE WAITING';
    }
    if (rowData.status === 'in progress') {
      s = serviceRequest.statusInProgress;
      status = 'IN PROGRESS';
    }
    if (rowData.status === 'completed') {
      s = serviceRequest.statusCompleted;
      status = 'COMPLETED';
    }

    return(
      <TouchableOpacity onPress={() => { this.serviceRequestClick(rowData)}} >
        <View style={serviceRequest.container}>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }} >
            <Text style={{ marginRight: 10, marginTop: 8, fontSize: 15 }}>
              { df(rowData.service_date, 'm/d/yy') }
            </Text>
          </View>
          <View style={{ marginLeft: 8, marginBottom: 8 }}>
            <Text style={s}>
              {status}
            </Text>
          </View>
          <View style={{ marginLeft: 8, marginBottom: 20 }}>
            <Text style={{ fontSize: 15 }}>
               { rowData.comment }
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;

    if (this.state.dataSource.getRowCount() > 0) {
      return (
        <View>
          <View
            style={{ backgroundColor: palette.HEADER_BLUE,
              alignSelf: 'stretch',
              height: HEIGHT,
              flexDirection: 'row',
              justifyContent: 'space-between' }}
          >
            <View style={{ width: 50 }} />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={common.headerTitle}>
                {this.state.currentVechicle.make} {this.state.currentVechicle.model}
              </Text>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => this.addServiceRequest()} >
                <Text style={common.blueAddHeaderButton}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ListView
            style={{ marginTop: 10 }}
            removeClippedSubviews={false}
            dataSource={this.state.dataSource}
            renderRow={this.renderRow.bind(this)}
          />
        </View>
      );
    } else {
      return (
        <View style={common.consumerContainer}>

          <View
            style={{ backgroundColor: palette.HEADER_BLUE,
              alignSelf: 'stretch',
              height: HEIGHT,
              flexDirection: 'row',
              justifyContent: 'space-between' }}
          >
            <View style={{ width: 50 }} />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={common.headerTitle}>
                Services
              </Text>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => this.addServiceRequest()} >
                <Text style={common.blueAddHeaderButton}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={common.thinGrayLine} />
          <View style={common.center}>
            <Image style={{ marginTop: 70 }} source={needServiceIcon} />
          </View>
          <View style={common.center}>
            <Text style={{ color: palette.BLACK, fontSize: 25, marginTop: 35 }}>
              Need a Service?
            </Text>
          </View>
          <View style={common.center}>
            <Text style={{ color: palette.GRAY, fontSize: 20, marginTop: 10 }}>
              Tap on the plus sign to add a new service
            </Text>
          </View>
        </View>
      );
    }
  }
}

ConsumerSvcHistory.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('ConsumerSvcHistory', () => ConsumerSvcHistory);
