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
import * as NetworkUtils from '../utils/networkUtils';

const emailIcon = require('../img/mail.png');
const phoneIcon = require('../img/call.png');

export default class MerchantActiveBid extends Component {
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
    console.log("job");
    console.log(JSON.stringify(state.params.job));
    this.state = {
      dataSource: ds,
      dict: {},
      job: state.params.job,
      messages: [],
      showMessagePopup: false,
    };
  }

  goBack() {
    const { goBack } = this.props.navigation;
    goBack();
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
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw Error(response.statusText)
        }
      })
      .then((responseData) => {

      }).catch((error) => {
        console.log(error);
      }).catch(error => {});
  }

  gotoEditBid(bid) {
    this.props.navigation.navigate('JobDetails', { job: this.state.job });
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
              Active Bid Summary
            </Text>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.setState({ showMessagePopup: true })} >
              <Text style={common.headerLeftButton}></Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{ backgroundColor: palette.LIGHT_GRAY,
            alignSelf: 'stretch',
            height: 50,
            flexDirection: 'row',
            justifyContent: 'space-between' }}>
            <Text style={{ width:50 }}>

            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row' }} >
                <Text style={{ color: palette.GRAY, fontSize: 20 }}>$</Text>
                <Text style={{ fontSize: 40, color: palette.BLACK }}>
                  {this.state.job.bid_total}
                </Text>
              </View>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => this.gotoEditBid()} >
                <Text style={{ fontSize: 20, color: palette.GRAY, paddingRight: 20 }}>
                  edit bid
                </Text>
              </TouchableOpacity>
            </View>
        </View>
          <View style={{ marginLeft: 10, marginTop: 20 }}>
              <Text style={{ fontSize: 18,
                  color: palette.BLACK,
                  fontWeight: 'bold', marginLeft: 10 }}>
                Requested services
              </Text>
              <View style={{ marginLeft: 10, marginBottom: 2 }} >
                <Text style={inbox.subTitle} numberOfLines={2} ellipsizeMode='tail'>
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
              <View style={{ marginLeft: 10, marginRight: 30, marginTop: 10, marginBottom: 20 }} >
                <Text style={{ fontSize: 15, color: palette.BLACK,}} numberOfLines={2} ellipsizeMode='tail'>
                  {this.state.job.comment}
                </Text>
              </View>
          </View>

        <Modal
          isVisible={this.state.showMessagePopup}
          onBackButtonPress={() => {this.setState({ showMessagePopup: false });}}
          onBackdropPress={() => {this.setState({ showMessagePopup: false });}}>
          <MessagePopup onSendClick={this.onMessageSendClick} />
        </Modal>

      </View>
    );
  }
}

MerchantActiveBid.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('MerchantActiveBid', () => MerchantActiveBid);
