import React, { Component, PropTypes } from 'react';
import { Alert, AppRegistry, Image, View, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ListView } from 'realm/react-native';
import format from 'string-format';
import { common, inbox } from '../style/style';
import realm from './realm';
import constants from '../constants/c';
import PushController from './PushController';
import palette from '../style/palette';
import * as jobEvents from '../broadcast/events';
import IconBadge from 'react-native-icon-badge';
import Icon from  'react-native-vector-icons/MaterialIcons';
import renderIf from 'render-if';
import * as NetworkUtils from '../utils/networkUtils';
import {trackScreenProperties, trackableEvents} from '../utils/analytics'

const bidsIcon = require('../img/tabbar/bids_on.png');

export default class MerchantBids extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const unread = params.badgeCount;
    return {
          title: 'Bids',
          header: null,
          tabBarIcon: ({ tintColor }) =>   params.badgeCount > 0 ? (
              <IconBadge
                MainElement={<Image
                  source={bidsIcon}
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
                    source={bidsIcon}
                    style={{ width: 26, height: 26, tintColor }}
                  />
            ),
        };
  };

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      dataSource: ds.cloneWithRows([]),
    };
    this.props.navigation.addListener(
        'didFocus',
        payload => {
          trackScreenProperties(
              trackableEvents.VIEWED_BIDS_PAGE, 
              {}
          )
        }
    );
  }

  componentDidMount() {
    jobEvents.getMerchantJobChangeEvents().subscribe((value) => {
      this.fetchData();
    });
    jobEvents.getSvcRequestMessageEvents().subscribe((value) => {
      this.fetchData();
    });
    this._sub = this.props.navigation.addListener('didFocus', this._updateData);
  }

  componentWillMount() {
    this._updateData();
  }

  _updateData = () => {
    this.fetchData();
  };

  componentWillUnmount() {
    this._sub.remove();
  }

  removeCanceledSvcRequest(srid) {
    let newJobList = [];
    this.state.jobs.forEach((job) => {
      if (job.service_request_id != srid) {
        newJobList.push(job);
      }
    });
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.setState({
      dataSource: ds.cloneWithRows(newJobList),
    });
    fetch(format('{}/api/provider/svcreq/{}/{}', constants.BASSE_URL, this.getUserId(), srid), {
      method: 'DELETE',
      headers: {
        Authorization: constants.API_KEY,
      },
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw Error(response.statusText)
        }
      })
      .then((responseData) => {

      }).catch(error =>{});
  }

  getUserId() {
    let uId = 0;
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      uId = userPrefs[0].userId;
    }
    return uId;
  }

  fetchData() {
    if (this.getUserId() > 0) {
      fetch(format('{}/api/provider/bids/{}', constants.BASSE_URL, this.getUserId()), {
        headers: {
          Authorization: constants.API_KEY,
        },
      })
        .then(response => {
          if (response.ok) {
            return response.json()
          } else {
            throw Error(response.statusText)
          }
        })
        .then((responseData) => {
          const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

          let sortedJobs = responseData.jobs.sort((a,b) => {
          if (new Date(a.service_date) < new Date(b.service_date)) {
              return 1;
            }
            if (new Date(a.service_date) > new Date(a=b.service_date)) {
              return -1;
            }
            // a must be equal to b
            return 0;
          });
          let dataSource = ds.cloneWithRows(sortedJobs);

          this.setState({
            dataSource: ds.cloneWithRows(responseData.jobs),
            isLoading: false,
            jobs: responseData.jobs
          });

          //update status locally and any unread notifications
          let unreadCount = 0;
          responseData.jobs.forEach((serviceRequest) => {
            serviceRequest.unread_notifications.forEach((notification) => {
              unreadCount++;
            });
          });

          this.props.navigation.setParams({ badgeCount: unreadCount});
        }).catch(error => {});
    }
  }

  gotoBidDetails(bid) {

    this.props.navigation.setParams({ badgeCount: 0});

    //call api to let server know that notificatons for this service request has been seen.
    fetch(format('{}/api/provider/svcreq/notification', constants.BASSE_URL), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: constants.API_KEY,
      },
      body: JSON.stringify({
        service_request_id: bid.service_request_id,
        service_provider_id: this.getUserId(),
      }),
    })
    .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw Error(response.statusText)
        }
      })
    .then((responseData) => {
    })
    .catch(error => {});

    //this is so dumb, but only way it works, otherwiese, keeps old state of badgeCount around
    //when the user goes back.
    setTimeout( () => {
      if (bid.status === 'in progress' && !bid.accepted) {

        Alert.alert(
          'Service request awarded to another provider',
          'Remove from list?',
          [
            {text: 'Yes', onPress: () => this.removeCanceledSvcRequest(bid.service_request_id)},
            {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          ],
          { cancelable: false }
        )

      } else if (!bid.accepted) {
        this.props.navigation.navigate('ActiveBid', { job: bid });
      } else {
        this.props.navigation.navigate('JobDetails', { job: bid });
      }
   },100);

  }

  renderRow(rowData, sectionID, rowID, highlightRow){
    console.log(JSON.stringify(rowData))
    let status;
    let s;
    let buttonText;
    let comment = '';
    if (rowData.comment) {
      comment = rowData.comment
    }
    if (rowData.accepted) {
      status = 'ACCEPTED';
      s = styles.statusAccepted;
      buttonText = 'View customer information';
    } else {
      status = 'OPEN';
      s = styles.statusOpen;
      if (rowData.did_bid) {
        buttonText = 'Bid submitted';
        status = 'SUBMITTED BID';
      } else {
        buttonText = 'Bid on service request';
      }
      if (rowData.status === 'in progress') {
        status = 'BID NOT ACCEPTED';
      }
    }

    if (rowData.did_bid) {
      return(
        <TouchableOpacity activeOpacity={1} onPress={() => { this.gotoBidDetails(rowData); }} >
          <View style={inbox.container}>
            <View style={{ marginLeft: 10, flexDirection: 'row', marginBottom: 2 }} >
              <View
                style={
                  { marginTop: 10,
                    marginRight: 10,
                    width: 5,
                    height: 5,
                    borderRadius: 5,
                    borderWidth: 5,
                    borderColor: palette.LIST_BLUE_DOT }}
              />
              <Text style={inbox.title}>
                Diagonostic Services
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }} >
              <View style={{ flex: 0.9 }}>
                <View style={{ marginLeft: 35, marginBottom: 2 }} >
                  <Text style={inbox.subTitle}>
                    {rowData.year} {rowData.make} {rowData.model}
                  </Text>
                </View>
                <View style={{ marginLeft: 35, marginRight: 30, marginBottom: 7 }} >
                  <Text style={inbox.subTitle} numberOfLines={2}>
                    {comment}
                  </Text>
                </View>
                <View style={[inbox.submittedBid]} >
                  <Text style={inbox.status} numberOfLines={2}>
                    {status}
                  </Text>
                </View>
              </View>
              {renderIf(rowData.unread_msg_count > 0)(
                <Icon.Button
                  name='message'
                  backgroundColor='rgba(0,0,0,0)'
                  color={palette.LIGHT_BLUE}
                  underlayColor='rgba(0,0,0,0)'
                  size={20}
                  iconStyle={{marginTop: -8, marginRight: 3}}
                  activeOpacity={1}
                  borderRadius={5} />
              )}
              <View style={{ flex: 0.1 }}>
                <Text style={inbox.arrow}>
                  &rsaquo;
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={styles.closedContainer}>
          <View style={styles.vehicle}>
            <Text style={styles.title}>
              {rowData.year} {rowData.make} {rowData.model}
            </Text>
            <Text style={styles.footnote}>
              Requested service date: {rowData.service_date}
            </Text>
            <Text style={styles.statusClosed}>
              closed
            </Text>
          </View>
        </View>
      );
    }

  }

  renderSeparator(sectionID, rowID, adjacentRowHighlighted){
    return(
      <View
        key={`${sectionID}-${rowID}`}
        style={{
          height: adjacentRowHighlighted ? 4 : 1,
          backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#CCCCCC',
          marginBottom: 10
        }}
      />
    );
  }

  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;

    if (this.state.dataSource.getRowCount() > 0) {
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
                Bids
              </Text>
            </View>
            <View style={{ width: 50 }} />
          </View>
          <ListView
            removeClippedSubviews={false}
            style={{ marginTop: 10 }}
            dataSource={this.state.dataSource}
            renderRow={this.renderRow.bind(this)}
            renderSeparator={this.renderSeparator}
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
                Bids
              </Text>
            </View>
            <View style={{ width: 50 }} />
          </View>

          <View>
            <Text style={{ textAlign: 'center', marginTop: 30, fontSize: 20 }}> There are no bids on any service requests. Service request show up in the request tab for bidding.</Text>
          </View>
        </View>

      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 120,
    backgroundColor: palette.WHITE,
    marginLeft: 8,
    marginRight: 8,
  },
  closedContainer: {
    flex: 1,
    height: 120,
    backgroundColor: '#D3D3D3',
    marginLeft: 8,
    marginRight: 8,
  },
  vehicle: {
    padding: 10,
  },
  statusAccepted: {
    fontSize: 13,
    color: '#2ECC71',
  },
  statusOpen: {
    fontSize: 13,
    color: '#FF8C00',
  },
  statusClosed: {
    fontSize: 13,
    color: '#A80000',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  footnote: {
    fontSize: 12,
    fontStyle: 'italic'
  },
  name: {
    fontSize: 20,
    textAlign: 'left',
    margin: 10,
  },
  desc: {
    textAlign: 'left',
    color: '#333333',
    marginBottom: 5,
    margin: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#dddddd',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    paddingVertical: 20,
  },
});

MerchantBids.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('MerchantBids', () => MerchantBids);
