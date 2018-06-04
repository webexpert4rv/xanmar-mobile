import React, { Component } from 'react';
import { DeviceEventEmitter, AppRegistry, Button, View, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { HeaderBackButton } from 'react-navigation';
import { ListView } from 'realm/react-native';
import { NavigationActions } from 'react-navigation'
import renderIf from 'render-if';
import df from 'dateformat';
import Modal from 'react-native-modal'
import format from 'string-format';
import Stars from 'react-native-stars'
import realm from './realm';
import constants from '../constants/c';
import PushController from './PushController';
import palette from '../style/palette';
import { bidStyles, common, inbox, formStyles } from '../style/style';
import MessagePopup from './ServiceRequestMessagePopup';
import * as events from '../broadcast/events';
import * as NetworkUtils from '../utils/networkUtils';

export default class ConsumerSvcRequestBidDetails extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.addService = this.addService.bind(this);
    this.onMessageSendClick = this.onMessageSendClick.bind(this);
    const { state } = this.props.navigation
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      dataSource: ds,
      dict: {},
      bid: state.params.bid,
      srid: state.params.srid,
      services: state.params.services,
      messages: [],
      showMessagePopup: false,
    };
  }

  componentDidMount() {
    this.loadMessages();
    events.getSvcRequestMessageEvents().subscribe((value) => {
      this.loadMessages();
    });
  }

  loadMessages(){
    let msgs = [];

    fetch(format('{}/api/svcreq/messages/{}', constants.BASSE_URL, this.state.srid), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
        this.setState({
          dataSource: ds.cloneWithRows(responseData.messages),
          isLoading: false,
          messages: responseData.messages,
        });
      }).catch(error => {});
  }

  loadRequest(svcs) {
    let serviceChecked = false;
    const servicesCategoryMap = {};
    svcs.forEach((service) => {
      // console.log('sssss');
      // console.log(JSON.stringify(service));
      if (!servicesCategoryMap[service.category]) {
        // Create an entry in the map for the category if it hasn't yet been created
        servicesCategoryMap[service.category] = [];
      }

      service.services.forEach((s) => {
        servicesCategoryMap[service.category].push(s);
        serviceChecked = true;
      });
    });

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    this.setState({
      dataSource: ds.cloneWithRowsAndSections(servicesCategoryMap),
      currentServices: svcs,
    });
  }

   addService(s, bid) {
     this.state.dict[s.service_id] = bid;
    //  console.log('ggg');
    //  console.log(this.state.dict);
   }

   getUserId() {
     let uId = 0;
     const userPrefs = realm.objects('UserPreference');
     if (userPrefs.length > 0) {
       uId = userPrefs[0].userId;
     }
     return uId;
   }

   getUserName() {
     let name = 0;
     const cp = realm.objects('ConsumerProfile');
     if (cp.length > 0) {
       name = cp[0].name;
     }
     return name;
   }

   goBack() {
     const { goBack } = this.props.navigation;
     goBack();
   }

   declineBid() {
     //TODO:  call API to declicne bid
     this.goBack();
   }
   acceptBid() {
     const { goBack } = this.props.navigation;
     const bid = {
       service_request_id: this.state.srid,
       service_provider_id: this.state.bid.service_provider_id,
       user_id: this.getUserId(),
     };
     fetch(format('{}/api/user/bid/accept', constants.BASSE_URL), {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         Authorization: constants.API_KEY,
       },
       body: JSON.stringify(bid),
     })
       .then(response => {
         if (response.ok) {
           return response.json()
         } else {
           throw Error(response.statusText)
         }
       })
       .then((responseData) => {
         //DeviceEventEmitter.emit('onBidAccepted', {});
         events.sendMerchantJobAcceptedEvent(true);
         const resetAction = NavigationActions.reset({
           index: 0,
           actions: [
             NavigationActions.navigate({ routeName: 'consumerTab' }),
           ],
         });
         this.props.navigation.dispatch(resetAction);
       }).catch(error => NetworkUtils.showNetworkError('Unable to accept bid.'));
   }

   renderRow(rowData, sectionID, rowID, highlightRow){
     return (


       <View style={{ flexDirection: 'row' }} minHeight={75} >
         <View style={{ flex: 0.8 }}>
           <View style={{ marginLeft: 30, marginBottom: 2 }} >
             <Text style={{    fontSize: 15, fontWeight: 'bold',}}>
               {rowData.msg_from}
             </Text>
             <Text style={{ marginTop: 5, color: palette.GRAY, color: palette.BLACK, marginBottom: 10 }} ellipsizeMode='tail' numberOfLines={4}>
               {rowData.message}
             </Text>
           </View>
         </View>
         <View style={{ flex: 0.2 }}>
           <Text>
             { df(rowData.message_date, 'm/d/yy') }
           </Text>
         </View>
       </View>
     );
   }

  renderSectionHeader(sectionData, category) {
    return (
      <View style={{ backgroundColor: '#6495ed'}}>
        <Text style={{ color: '#ffffff', marginLeft: 5, fontSize: 23 }}>{category}</Text>
      </View>
    )
  }

  gotoMerchantReviews() {
    const { navigate } = this.props.navigation;
    navigate('MerchantReviews',
      {
        bid: this.state.bid,
      }
    );
  }

  onMessageSendClick(msg) {
    this.setState({ showMessagePopup: false });

    const newMsgRequest = {
      service_request_id: this.state.srid,
      sender_id: this.getUserId(),
      sender_type: "consumer",
      create_date: new Date(),
      message: msg,
    };

    const message = {
        msg_from: this.getUserName(),
        message: msg,
        message_date:newMsgRequest.create_date,
    };

    this.state.messages.unshift(message);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.setState({ dataSource: ds.cloneWithRows(this.state.messages) })

    fetch(format('{}/api/svcreq/message', constants.BASSE_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: constants.API_KEY,
      },
      body: JSON.stringify(newMsgRequest),
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw Error(response.statusText)
        }
      })
      .then((responseData) => {

      }).catch(error => {});
  }

  render() {
    var total = this.state.bid.bid_total;
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;

    if (this.state.bid.accepted) {
      return (
        <View style={bidStyles.customerInfo}>
          <View>
            <Text style={{ textAlign: 'center', marginTop: 30, marginBottom: 15, fontSize: 20, fontWeight: 'bold' }}>Service Provider Contact Information </Text>
          </View>
          <View>
            <Text style={ bidStyles.customerDetail}>
             Name: {this.state.bid.business_name}
            </Text>
          </View>
          <View>
            <Text style={ bidStyles.customerDetail}>
             Phone: {this.state.bid.phone}
            </Text>
          </View>
          <View>
            <Text style={ bidStyles.customerDetail}>
             Email: {this.state.bid.email}
            </Text>
          </View>
          <View>
            <Text style={ bidStyles.customerDetail}>
             Address: {this.state.bid.address}
             {this.state.bid.city} {this.state.bid.state} {this.state.bid.zip}
            </Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={{flex: 1, backgroundColor: palette.WHITE}}>

        <View
          style={{
            backgroundColor: palette.HEADER_BLUE,
            alignSelf: 'stretch',
            height: HEIGHT,
            flexDirection: 'row',
            justifyContent: 'space-between' }}
        >
          <HeaderBackButton tintColor={palette.WHITE} onPress={() => this.goBack()} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={common.headerTitle}>
              Service Request
            </Text>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={common.headerTitle}></Text>
          </View>
        </View>
        <View style={{flex: 1, backgroundColor: palette.WHITE}}>
          <TouchableOpacity onPress={() => this.gotoMerchantReviews()} style={{ marginTop:10, flex: .20, flexDirection: 'row' }} >
            <View style={{ flex: 0.8 }}>
              <View style={{ marginLeft: 30, marginBottom: 2 }} >
                <Text style={styles.title}>
                  {this.state.bid.business_name}
                </Text>
                <View style={{ flexDirection: 'row', marginTop: 5 }} >
                  <Stars
                    value={parseFloat(this.state.bid.rating)}
                    spacing={8}
                    count={5}
                    starSize={15}
                    fullStar= {require('../img/starFilled.png')}
                    emptyStar= {require('../img/starEmpty.png')}/>
                    <View style={{ marginLeft:10, borderBottomWidth: 1, borderColor: palette.GRAY }}>
                      <Text style={{ color: palette.GRAY, paddingBottom: 3 }}>
                        ({this.state.bid.review_count}) Reviews
                      </Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row' }} >
                   <View >
                     <Text style={{ marginTop: 5, color: palette.GRAY, color: palette.BLACK }} ellipsizeMode='tail' numberOfLines={3}>

                     </Text>
                   </View>
                </View>
              </View>
            </View>
            <View style={{ flex: 0.2 }}>
              <Text style={styles.title}>
                ${total.toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>

            <View style={{ flex: 0.70 }}>
              <ListView
                style={{ marginTop: 5 }}
                dataSource={this.state.dataSource}
                renderRow={this.renderRow.bind(this)}
                enableEmptySections={true}
                renderSeparator={this.renderSeparator}
              />
            </View>

          <View style={{ flex: .05, flexDirection: 'row', marginBottom: 8 }} >
              <View style={{ width: 200, height: 200}}>
                <Button
                  onPress={() => this.declineBid()}
                  color={palette.DECLINE_RED}
                  title="Decline Bid"
                />
              </View>
              <View style={{ width: 200, height: 200}}>
                <Button
                  onPress={() => this.acceptBid()}
                  color={palette.HIRE_BLUE}
                  title="Hire"
                />
              </View>
            </View>
          </View>
          <Modal
            isVisible={this.state.showMessagePopup}
            avoidKeyboard={Platform.OS === 'ios' ? true : false}
            onBackButtonPress={() => {this.setState({ showMessagePopup: false });}}
            onBackdropPress={() => {this.setState({ showMessagePopup: false });}}>
            <MessagePopup onSendClick={this.onMessageSendClick} />
          </Modal>

        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  listSection: {
    flex: 0.80,
  },
  butSection: {
    flex: 0.10,
  },
  infoSection: {
    flex: 0.10,
  },
  container: {
    flex: 1,
    height: 100,
    backgroundColor: '#F5FCFF',
    marginLeft: 8,
    marginRight: 8,
  },
  vehicle: {
    padding: 10,
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

AppRegistry.registerComponent('ConsumerSvcRequestBidDetails', () => ConsumerSvcRequestBidDetails);
