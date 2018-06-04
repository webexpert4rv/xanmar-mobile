import React, { Component, PropTypes } from 'react';
import { Alert, AppRegistry, Button, Image, View, Platform, StyleSheet, ScrollView, Text, TextInput, TouchableHighlight, TouchableOpacity } from 'react-native';
import { ListView } from 'realm/react-native';
import renderIf from 'render-if';
import Stars from 'react-native-stars'
import { HeaderBackButton } from 'react-navigation';
import format from 'string-format';
import Communications from 'react-native-communications';
import df from 'dateformat';
import Modal from 'react-native-modal'
import { common, quote, inbox, reviewPopup } from '../style/style';
import realm from './realm';
import constants from '../constants/c';
import PushController from './PushController';
import palette from '../style/palette';
import MessagePopup from './ServiceRequestMessagePopup';
import * as events from '../broadcast/events';
import * as NetworkUtils from '../utils/networkUtils';

const emailIcon = require('../img/mail.png');
const phoneIcon = require('../img/call.png');
const mapIcon = require('../img/map.png');

export default class ConsumerSvcRequestSummary extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { state } = this.props.navigation
    this.onMessageSendClick = this.onMessageSendClick.bind(this);
    this.onMessageCancelClick = this.onMessageCancelClick.bind(this);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    let company, address, city, st, zip, bidTotal, phone, email, spi, bid;
    for (var b of state.params.svcRequest.bids) {
      if (b.accepted) {
        spi = b.service_provider_id;
        company = b.business_name;
        address = b.address;
        city = b.city;
        st = b.state;
        zip = b.zip;
        bidTotal = b.bid_total;
        phone = b.phone;
        email = b.email;
        bid = b;
      }
    }
    this.state = {
      dataSource: ds,
      svcRequest: state.params.svcRequest,
      bid: bid,
      spi: spi,
      company: company,
      address: address,
      city: city,
      st: st,
      zip: zip,
      bidTotal: bidTotal,
      phone: phone,
      email: email,
      showReviewPopup: false,
      messages: [],
      showMessagePopup: false,
      svcProviderRating: bid.rating,
      svcProviderReviewCount: bid.review_count,
    };

  }
//this.state.bid.rating  this.state.bid.review_count
  // getAcceptedBid() {
  //   for (var bid of this.state.svcRequest.bids) {
  //     if (bid.accepted) {
  //       this.setState({
  //         company: bid.business_name,
  //       });
  //     }
  //   }
  // }
  componentDidMount() {
    // const { state } = this.props.navigation
    // console.log(JSON.stringify(this.state.job));
    //this.loadRequest(this.state.job.services);
    this.loadMessages();
    events.getSvcRequestMessageEvents().subscribe((value) => {
      this.loadMessages();
    });
  }

  goBack() {
    const { goBack } = this.props.navigation;
    goBack();
  }

  loadMessages(){
    let msgs = [];

    fetch(format('{}/api/svcreq/messages/{}', constants.BASSE_URL, this.state.svcRequest.service_request_id), {
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

  renderRow(rowData, sectionID, rowID, highlightRow){
    return (


      <View style={{ flexDirection: 'row' }} minHeight={75} >
        <View style={{ flex: 0.8 }}>
          <View style={{ marginLeft: 30, marginBottom: 2 }} >
            <Text style={{    fontSize: 15, fontWeight: 'bold',}}>
              {rowData.msg_from}
            </Text>
            <Text style={{ fontSize: 15, marginTop: 5, color: palette.GRAY, color: palette.BLACK, marginBottom: 10 }} ellipsizeMode='tail' numberOfLines={4}>
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
      <View style={{marginBottom: 10,     width: 600,
          borderWidth: 0.3,
          borderColor: palette.GRAY}} />
    );
  }

  markComplete() {
    this.recalculateRating();

    let svcR = this.state.svcRequest;
    svcR.status = 'completed';

    this.setState({ showReviewPopup: false, svcRequest: svcR });

    const reviewRequest = {
      service_request_id: this.state.svcRequest.service_request_id,
      service_provider_id: this.state.spi,
      review_date: new Date(),
      rating: this.state.rating,
      review: this.state.comment,
    };

    fetch(format('{}/api/provider/review', constants.BASSE_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: constants.API_KEY,
      },
      body: JSON.stringify(reviewRequest),
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw Error(response.statusText)
        }
      })
      .then((responseData) => {

        // update status to complete
        let svcRequest = realm.objects('ServiceRequest');
        let sr = svcRequest.filtered(format('service_request_id == {}', reviewRequest.service_request_id));
        realm.write(() => {
          sr[0].status = 'completed';
        });

        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: 'consumerTab' }),
          ],
        });
        this.props.navigation.dispatch(resetAction);
      }).catch(error => NetworkUtils.showNetworkError('Unable to submit review'));
  }

  onMessageSendClick(msg) {
    this.setState({ showMessagePopup: false });

    const newMsgRequest = {
      service_request_id: this.state.svcRequest.service_request_id,
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

  onMessageCancelClick() {
    this.setState({ showMessagePopup: false })
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

  gotoMap() {
    const { navigate } = this.props.navigation;
    navigate('MerchantMap',
      {
        bid: this.state.bid,
      }
    );
  }

  recalculateRating() {

    let oldAvg = this.state.svcProviderRating;
    let oldItemsCount = this.state.svcProviderReviewCount;
    let newItem = this.state.rating;
    let newTotal = parseInt(this.state.svcProviderReviewCount, 10) + 1;
    let newAvg = ((oldAvg * oldItemsCount) + newItem)/newTotal;
    this.setState({
      svcProviderRating: newAvg,
      svcProviderReviewCount: newTotal,
    });

  }

  render() {
    const { state } = this.props.navigation;
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    let svcRequestServices = "";
    this.state.svcRequest.services.forEach((service) => {
      service.services.forEach((service) => {
        svcRequestServices += service.name + ", ";
      });
    });

    return (
     <View style={{ backgroundColor: palette.WHITE, flex: 1 }}>
       <View style={{ flex: 0.71 }}>
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
             <TouchableOpacity style={{ marginRight: 10 }} onPress={() => this.setState({ showMessagePopup: true })}>
               <Text style={common.headerTitle}>Reply</Text>
             </TouchableOpacity>
           </View>
         </View>
         <View style={{ backgroundColor: palette.HEADER_BLUE, height: 120 }}>
           <View style={{ flexDirection: 'row' }} >
             <View style={{ flex: 0.6 }}>
               <View style={{ marginLeft: 35, marginBottom: 2 }} >
                 <Text style={{ color: palette.WHITE, fontWeight: 'bold', fontSize: 17 }}>
                   {this.state.company}
                 </Text>
               </View>
               <View style={{ marginLeft: 35, flexDirection: 'row', marginTop: 5, marginBottom: 5 }} >
                 <Stars
                    value={parseFloat(this.state.svcProviderRating)}
                    backingColor={palette.HEADER_BLUE}
                    spacing={8}
                    count={5}
                    starSize={15}
                    fullStar= {require('../img/starFilled.png')}
                    emptyStar= {require('../img/starEmpty.png')}/>
                    <Text style={{ marginLeft:10, color: palette.GRAY }}>
                      {this.state.svcProviderReviewCount} Reviews
                    </Text>
               </View>
               <View style={{ marginLeft: 35, marginRight: 30, marginBottom: 7 }} >
                 <Text style={{ color: palette.WHITE }} numberOfLines={1}>
                   {this.state.address}
                 </Text>
                 <Text style={{ color: palette.WHITE }} numberOfLines={1}>
                   {this.state.city} {this.state.st} {this.state.zip}
                 </Text>
               </View>
               <View style={{ marginLeft: 35, marginRight: 30, marginBottom: 10 }} >
                 <Text style={{ color: palette.GREEN }} numberOfLines={1}>
                 HIRED FOR ${this.state.bidTotal}
                 </Text>
               </View>
             </View>
             <View style={{ flex: 0.4, flexDirection: 'row', alignItems: 'center' }}>
               <View style={{ marginRight: 10 }}>
                 <TouchableOpacity onPress={() => this.gotoMap()}>
                   <Image source={mapIcon} />
                 </TouchableOpacity>
               </View>
               <View style={{ marginRight: 10 }}>
                 <TouchableOpacity onPress={() => Communications.email([this.state.email],null,null,'Xanmar Service request','')}>
                   <Image source={emailIcon} />
                 </TouchableOpacity>
               </View>
               <TouchableOpacity onPress={() => Communications.phonecall(this.state.phone, true)}>
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
             <Text style={{ fontSize: 18, textAlign: 'center', marginLeft: 10, marginRight: 10 }}>
               You can message your service provider by clicking reply above.
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
       <View style={{ flex: 0.29 }}>
         <View style={{ marginTop: 15 }}>
             <Text style={{ fontSize: 18,
                 color: palette.BLACK,
                 fontWeight: 'bold', marginLeft: 10 }}>
               Requested services
             </Text>
             <View style={{ marginLeft: 10, marginBottom: 2 }} >
               <Text style={inbox.subTitle} ellipsizeMode='tail' numberOfLines={1}>
                 {svcRequestServices}
               </Text>
             </View>
             <View style={{ marginLeft: 10, marginTop: 2, marginBottom: 2 }} >
               <Text style={inbox.subTitle}>
                 Vehicle: {this.state.svcRequest.year} {this.state.svcRequest.make} {this.state.svcRequest.model}
               </Text>
             </View>
             <View style={{ marginLeft: 10, marginBottom: 2 }} >
               <Text style={inbox.subTitle}>
                 Request Date: { df(this.state.svcRequest.service_date, 'm/d/yy') }
               </Text>
             </View>
             <View style={{ marginLeft: 10, marginRight: 30, marginBottom: 5, height: 35 }} >
               <Text style={{ fontSize: 15, color: palette.BLACK,}} numberOfLines={2} ellipsizeMode='tail'>
                  {this.state.svcRequest.comment}
               </Text>
             </View>
         </View>
         {renderIf(this.state.svcRequest.status != 'completed' )(
           <View style={{ height: 47, backgroundColor: palette.LIGHT_BLUE, alignItems: 'center', justifyContent: 'center' }}>
             <TouchableOpacity onPress={() => this.setState({ showReviewPopup: true })}>
               <Text style={{ fontSize: 18, textAlign: 'center', color: palette.WHITE }}>
                 Mark as Complete
               </Text>
             </TouchableOpacity>
           </View>
         )}
         <Modal
           isVisible={this.state.showReviewPopup}
           avoidKeyboard={Platform.OS === 'ios' ? true : false}>
          <View style={reviewPopup.container}>
            <View style={{ flex: 0.20, backgroundColor: palette.MERCHANT_HEADER_COLOR, borderTopLeftRadius: 10,
                borderTopRightRadius: 10}}>
                <View style={{ marginLeft: 35, marginBottom: 2, marginRight: 10 }} >
                  <Text style={{ marginTop: 10, color: palette.WHITE, fontWeight: 'bold', fontSize: 17 }}>
                    {this.state.company}
                  </Text>
                </View>
                <View style={{ marginLeft: 35, marginRight: 30, marginBottom: 7 }} >
                  <Text style={{ color: palette.WHITE }} numberOfLines={1}>
                    {this.state.address}
                  </Text>
                  <Text style={{ color: palette.WHITE }} numberOfLines={1}>
                    {this.state.city} {this.state.st} {this.state.zip}
                  </Text>
                </View>
            </View>
            <View style={{ flex: 0.70, backgroundColor: palette.WHITE}}>
             <View style={{ marginTop: 10 }}>
               <Stars
                half={false}
                rating={0}
                update={(val)=>{this.setState({rating: val})}}
                spacing={4}
                starSize={40}
                count={5}
                fullStar= {require('../img/starFilled.png')}
                emptyStar= {require('../img/starEmpty.png')}/>
                <TextInput
                  style={{ marginLeft:10, marginTop:20, width: 280, height: 240, backgroundColor: palette.WHITE }}
                  placeholder='Leave a Comment'
                  placeholderTextColor={ palette.GRAY }
                  fontSize={20}
                  textAlignVertical={'top'}
                  multiline
                  numberOfLines={5}
                  blurOnSubmit={false}
                  editable
                  onChangeText={(txt) => {
                    this.setState({ comment: txt });
                  }}
                  value={this.state.comment}
                  onSubmitEditing={() => {
                    if (!this.state.comment.endsWith('\n')) {
                      let comment = this.state.comment;
                      comment = comment + "\n";
                      this.setState({ comment })
                    }
                  }}
                />
             </View>
            </View>
            <View style={{ flex: 0.10, backgroundColor: palette.LIGHT_BLUE, alignItems: 'center',
            justifyContent: 'center',borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
              <TouchableOpacity onPress={() => this.markComplete()}>
                <Text style={{ fontSize: 18, textAlign: 'center', color: palette.WHITE }}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
         </Modal>

         <Modal
           isVisible={this.state.showMessagePopup}
           avoidKeyboard={Platform.OS === 'ios' ? true : false}
           onBackButtonPress={() => {this.setState({ showMessagePopup: false });}}
           onBackdropPress={() => {this.setState({ showMessagePopup: false });}}>
           <MessagePopup onSendClick={this.onMessageSendClick} />
         </Modal>
       </View>
     </View>
    );
  }
}


ConsumerSvcRequestSummary.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('ConsumerSvcRequestSummary', () => ConsumerSvcRequestSummary);
