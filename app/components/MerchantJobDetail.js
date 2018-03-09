import React, { Component, PropTypes } from 'react';
import { Alert, AppRegistry, Button, Image, View, Platform, StyleSheet, ScrollView, Text, TextInput, TouchableHighlight, TouchableOpacity } from 'react-native';
import { ListView } from 'realm/react-native';
import renderIf from 'render-if';
import { HeaderBackButton } from 'react-navigation';
import format from 'string-format';
import Communications from 'react-native-communications';
import Modal from 'react-native-modal';
import df from 'dateformat';
import { common, quote, inbox } from '../style/style';
import realm from './realm';
import constants from '../constants/c';
import palette from '../style/palette';
import MessagePopup from './ServiceRequestMessagePopup';
import * as events from '../broadcast/events';

const emailIcon = require('../img/mail.png');
const phoneIcon = require('../img/call.png');

export default class MerchantJobDetail extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.onMessageSendClick = this.onMessageSendClick.bind(this);
    const { state } = this.props.navigation
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    // console.log("job");
    // console.log(JSON.stringify(state.params.job));
    this.state = {
      dataSource: ds,
      dict: {},
      job: state.params.job,
      messages: [],
      showMessagePopup: false,
      quote: state.params.job.bid_total,
    };
  }

  componentDidMount() {
    this.loadMessages();
    this.updateAccountStatus();
    events.getSvcRequestMessageEvents().subscribe((value) => {
      this.loadMessages();
    });
  }

  goBack() {
    const { goBack } = this.props.navigation;
    goBack();
  }

  getUserId() {
    let uId = 0;
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      uId = userPrefs[0].userId;
    }
    return uId;
  }

  getCustId() {
    let cId = 0;
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      cId = userPrefs[0].customerId;
    }
    return cId;
  }

  updateAccountStatus() {
    fetch(format('{}/api/provider/metadata/{}/{}', constants.BASSE_URL, this.getCustId(),
    this.getUserId()), {
      headers: {
        Authorization: constants.API_KEY,
      },
    })
      .then(response => response.json())
      .then((responseData) => {

        this.setState({
          statusExplaination: responseData.status_explaination,
        });

        const userPrefs = realm.objects('UserPreference');
        if (userPrefs.length > 0) {
          realm.write(() => {
            userPrefs[0].status = responseData.status;
            userPrefs[0].plan = responseData.plan;
          });
        }
      })
      .done();
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

   getUserId() {
     let uId = 0;
     const userPrefs = realm.objects('UserPreference');
     if (userPrefs.length > 0) {
       uId = userPrefs[0].userId;
     }
     return uId;
   }

 accountActive() {
   const userPrefs = realm.objects('UserPreference');

   // console.log(JSON.stringify(userPrefs));
   let status;
   let active = false;

   if (userPrefs.length > 0) {
     status = userPrefs[0].status;
     if (status === 'active') {
       active = true;
     }
   }

   return active;
 }
  validateBid() {
    let bidValid = true;

    if (this.state.quote === undefined || this.state.quote.length === 0) {
      bidValid = false;
    }

    return bidValid;
  }

  postBid() {
    if (this.accountActive()) {
      if (this.validateBid()) {
        const bid = {
          service_request_id: this.state.job.service_request_id,
          quote: this.state.quote,
        };


        const { goBack } = this.props.navigation;
        fetch(format('{}/api/provider/bid/{}', constants.BASSE_URL, this.getUserId()), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: constants.API_KEY,
          },
          body: JSON.stringify(bid),
        })
         .then(response => response.json())
         .then((responseData) => {
           goBack();
         })
         .done();
      } else {
        Alert.alert(
        'Error',
        'A zero quote is not allowed',
          [
            { text: 'OK' },
          ],
        { cancelable: false }
      );
      }
    } else {

      Alert.alert(
        'Error',
        this.state.statusExplaination,
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: false }
      );
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

  getUserName() {
    let name = 0;
    const spp = realm.objects('ServiceProviderProfile');
    if (spp.length > 0) {
      name = spp[0].business_name;
    }
    return name;
  }

  onMessageSendClick(msg) {
    this.setState({ showMessagePopup: false });

    const newMsgRequest = {
      service_request_id: this.state.job.service_request_id,
      sender_id: this.getUserId(),
      sender_type: "serviceprovider",
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
      .then(response => response.json())
      .then((responseData) => {

      }).catch((error) => {
        console.log(error);
      })
      .done();
  }

  loadMessages() {
    let msgs = [];
    console.log("loading messages");
    fetch(format('{}/api/svcreq/messages/{}', constants.BASSE_URL, this.state.job.service_request_id), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: constants.API_KEY,
      },
    })
      .then(response => response.json())
      .then((responseData) => {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.setState({
          dataSource: ds.cloneWithRows(responseData.messages),
          isLoading: false,
          messages: responseData.messages,
        });
        console.log("")
      }).catch((error) => {
        console.log(error);
      })
      .done();
  }

  renderRow(rowData, sectionID, rowID, highlightRow){
    return (
      <View style={{ flexDirection: 'row' }} minHeight={75} >
        <View style={{ flex: 0.8 }}>
          <View style={{ marginLeft: 20, marginBottom: 2 }} >
            <Text style={{    fontSize: 15, fontWeight: 'bold', color: palette.BLACK }}>
              {rowData.msg_from}
            </Text>
            <Text style={{ marginTop: 5, color: palette.GRAY, marginBottom: 10 }} ellipsizeMode='tail' numberOfLines={4}>
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

  renderSeparator(sectionID, rowID, adjacentRowHighlighted){
    return(
      <View key={rowID} style={{marginBottom: 10,width: 600,
          borderWidth: 0.3,
          borderColor: palette.GRAY}} />
    );
  }

  render() {
    const { state } = this.props.navigation;
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    let jobServices = "";
    this.state.job.services.forEach((service) => {
      service.services.forEach((service) => {
        jobServices += service.name + ", ";
      });
    });

    if (this.state.job.accepted) {
       return (
        <View style={{ backgroundColor: palette.WHITE, flex: 1 }}>
          <View style={{ flex: 0.93 }}>
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
                  Request Details
                </Text>
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity style={{ marginRight: 10 }} onPress={() => this.setState({ showMessagePopup: true })} >
                  <Text style={common.headerTitle}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ backgroundColor: palette.HEADER_BLUE, height: 100 }}>
              <View style={{ flexDirection: 'row' }} >
                <View style={{ flex: 0.7 }}>
                  <View style={{ marginLeft: 35, marginBottom: 2 }} >
                    <Text style={{ color: palette.WHITE, fontWeight: 'bold', fontSize: 17 }}>
                      {this.state.job.customer_info.name}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 35, marginRight: 30, marginBottom: 10 }} >
                    <Text style={{ color: palette.WHITE }} numberOfLines={1}>
                      {this.state.job.year} {this.state.job.make} {this.state.job.model}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 35, marginRight: 30, marginBottom: 7 }} >
                    <Text style={{ color: palette.GREEN }} numberOfLines={1}>
                    HIRED YOU FOR ${this.state.job.bid_total}
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 0.3, flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => Communications.phonecall(this.state.job.customer_info.email, true)} style={{ marginRight: 10 }}>
                    <Image source={emailIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Communications.phonecall(this.state.job.customer_info.phone, true)}>
                    <Image source={phoneIcon} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {renderIf(this.state.messages.length === 0)(
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18 }}>
                  No messages available
                </Text>
                <Text style={{ fontSize: 18, textAlign: 'center' }}>
                  You can message your customer by clicking reply above.
                </Text>
              </View>
            )}
            {renderIf(this.state.messages.length > 0)(
              <ListView
                style={{ marginTop: 10 }}
                dataSource={this.state.dataSource}
                renderRow={this.renderRow.bind(this)}
                renderSeparator={this.renderSeparator}
              />
            )}
          </View>
          <View style={{ flex: 0.07, backgroundColor: palette.GRAY, alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => Communications.phonecall(this.state.job.customer_info.phone, true)}>
              <Text style={{ fontSize: 18, textAlign: 'center', color: palette.WHITE }}>
                Mark as Complete
              </Text>
            </TouchableOpacity>
          </View>

          <Modal
            isVisible={this.state.showMessagePopup}
            onBackButtonPress={() => {this.setState({ showMessagePopup: false });}}
            onBackdropPress={() => {this.setState({ showMessagePopup: false });}}>
            <MessagePopup onSendClick={this.onMessageSendClick} />
          </Modal>

        </View>
       );
     } else {

       let submitButtonText = 'Submit';
       if (this.state.job.status === 'bidding') {
         submitButtonText = 'Update'
       }
       return (
         <View style={common.consumerContainer}>
           <View
             style={{ backgroundColor: palette.HEADER_BLUE,
               alignSelf: 'stretch',
               height: HEIGHT,
               flexDirection: 'row',
               justifyContent: 'space-between' }}
           >
             <HeaderBackButton tintColor={palette.WHITE} onPress={() => this.goBack()} />
             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
               <Text style={common.headerTitle}>
                 Submit Quote
               </Text>
             </View>
             <View style={{ justifyContent: 'center', alignItems: 'center' }}>
               <TouchableOpacity onPress={() => this.postBid()} >
                 <Text style={common.headerLeftButton}>{submitButtonText}</Text>
               </TouchableOpacity>
             </View>
           </View>

           <ScrollView>
             <View style={quote.container}>
               <View style={{ flexDirection: 'row' }} >
                 <Text style={{ marginTop: 30, color: palette.GRAY, fontSize: 30 }}>$</Text>
                 <TextInput
                   keyboardType="numeric"
                   style={quote.textInput}
                   underlineColorAndroid="rgba(0,0,0,0)"
                   autoCorrect={false}
                   placeholder="0"
                   placeholderTextColor={palette.WHITE}
                   onChangeText={text => this.setState({ quote: text })}
                   value={this.state.quote}
                 />
               </View>
             </View>
             <View style={quote.merchantMessage}>
               <TextInput
                 style={{ height: 140, marginLeft: 10,
                          marginRight: 10, textAlignVertical: 'top'}}
                 multiline={true}
                 underlineColorAndroid="rgba(0,0,0,0)"
                 autoCorrect={false}
                 placeholder="Add a reply to this request."
                 placeholderTextColor={palette.VERY_LIGHT_GRAY}
               />
             </View>

             <View style={{ marginTop: 15 }}>
                 <Text style={{ fontSize: 18,
                     color: palette.BLACK,
                     fontWeight: 'bold', marginLeft: 10 }}>
                   Requested services
                 </Text>
                 <View style={{ marginLeft: 10, marginBottom: 2 }} >
                   <Text style={inbox.subTitle}>
                     {jobServices}
                   </Text>
                 </View>
                 <View style={{ marginLeft: 10, marginTop: 5, marginBottom: 2 }} >
                   <Text style={inbox.subTitle}>
                     Vehicle: {this.state.job.year} {this.state.job.make} {this.state.job.model}
                   </Text>
                 </View>
                 <View style={{ marginLeft: 10, marginBottom: 2 }} >
                   <Text style={inbox.subTitle}>
                     Request Date: {this.state.job.service_date}
                   </Text>
                 </View>
                 <View style={{ marginLeft: 10, marginRight: 30, marginTop: 10, marginBottom: 7 }} >
                   <Text style={{ fontSize: 15, color: palette.BLACK,}} numberOfLines={2}>
                     {this.state.job.comment}
                   </Text>
                 </View>
                 <View style={{ marginLeft: 10, marginRight: 30, marginTop: 10, marginBottom: 7 }} >
                   <Image
                      style={{width: 200, height: 200}}
                      source={{uri: this.state.job.photos[0]}}
                    />
                 </View>
             </View>
           </ScrollView>

         </View>
       );
    }
  }
}


MerchantJobDetail.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('MerchantJobDetail', () => MerchantJobDetail);
