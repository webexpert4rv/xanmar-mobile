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
import * as NetworkUtils from '../utils/networkUtils';

const emailIcon = require('../img/mail.png');
const phoneIcon = require('../img/call.png');

export default class MerchantReviews extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { state } = this.props.navigation
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });

    this.state = {
      dataSource: ds,
      bid: state.params.bid,
      reviews: [],
      servicesOffered: [],
    };

  }

  componentDidMount() {
    this.loadReviews();
  }

  goBack() {
    const { goBack } = this.props.navigation;
    goBack();
  }

  // loadReviews(){
  //   let msgs = [];
  //   this.setState({
  //     reviews: msgs,
  //   });
  // }

  loadReviews() {
    fetch(format('{}/api/provider/reviews/{}', constants.BASSE_URL, this.state.bid.service_provider_id),{
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
        this.setState({
          dataSource: ds.cloneWithRows(responseData.reviews),
          loading: false,
          reviews: responseData.reviews,
          servicesOffered: responseData.servicesOffered,
        });
      }).catch(error => {});
  }

  renderRow(rowData, sectionID, rowID, highlightRow){
    return (
      <View style={{flex: 1, flexDirection: 'column', marginLeft: 10, justifyContent: 'space-between', marginTop: 10}}>
        <View style={{ alignItems: 'flex-start' }}>
          <View style={{ marginBottom: 8, marginLeft: -2 }}>
            <Stars
               value={parseFloat(rowData.rating)}
               backingColor={palette.WHITE}
               spacing={8}
               count={5}
               starSize={15}
               fullStar= {require('../img/starFilled.png')}
               emptyStar= {require('../img/starEmpty.png')}/>
          </View>

            <Text style={{ marginBottom: 8 }} ellipsizeMode='tail' numberOfLines={5}>
              {rowData.review}
            </Text>
            <Text style={{ color: palette.GRAY}}>
              { df(rowData.review_dt, 'mmm d, yyyy') }
            </Text>
        </View>
        <View style={{ marginTop:10, width: 600, borderWidth: 1, borderColor: palette.LIGHT_GRAY }} />
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

  render() {
    const { state } = this.props.navigation;
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    let svcRequestServices = "";
    this.state.servicesOffered.forEach((service) => {
      svcRequestServices += service + ", ";
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
               Merchant Reviews
             </Text>
           </View>
           <View style={{ justifyContent: 'center', alignItems: 'center' }}>
             <TouchableOpacity style={{ marginRight: 10 }}>
               <Text style={common.headerTitle}></Text>
             </TouchableOpacity>
           </View>
         </View>
         <View style={{ backgroundColor: palette.WHITE, height: 100 }}>
           <View style={{ flexDirection: 'row' }} >
             <View style={{ flex: 0.7 }}>
               <View style={{ marginLeft: 10, marginBottom: 2, marginTop: 5 }} >
                 <Text style={{ color: palette.BLACK, fontWeight: 'bold', fontSize: 17 }}>
                   {this.state.bid.business_name}
                 </Text>
               </View>
               <View style={{ marginLeft: 10, flexDirection: 'row', marginTop: 5, marginBottom: 5 }} >
                 <Stars
                    value={parseFloat(this.state.bid.rating)}
                    backingColor={palette.WHITE}
                    spacing={8}
                    count={5}
                    starSize={15}
                    fullStar= {require('../img/starFilled.png')}
                    emptyStar= {require('../img/starEmpty.png')}/>
                    <Text style={{ marginLeft:10, color: palette.GRAY }}>
                      ({this.state.bid.review_count}) Reviews
                    </Text>
               </View>
               <View style={{ marginLeft: 10, marginRight: 30, marginBottom: 7 }} >
                 <Text style={{ color: palette.BLACK }} numberOfLines={1}>
                   {this.state.bid.address}
                 </Text>
                 <Text style={{ color: palette.BLACK }} numberOfLines={1}>
                   {this.state.bid.city} {this.state.bid.st} {this.state.bid.zip}
                 </Text>
               </View>
             </View>
           </View>
         </View>
         <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
           <View style={{ marginRight: 10 }}>
             <TouchableOpacity onPress={() => Communications.email([this.state.bid.email],null,null,'Xanmar Service request','')}>
               <Image source={emailIcon} />
             </TouchableOpacity>
           </View>
           <TouchableOpacity onPress={() => Communications.phonecall(this.state.bid.phone, true)}>
             <Image source={phoneIcon} />
           </TouchableOpacity>
         </View>
         <View style={{ marginTop: 10, width: 600, borderWidth: 1, borderColor: palette.LIGHT_GRAY }} />

         <View>
           <View style={{ marginTop: 15, marginBottom:10 }}>
               <Text style={{ fontSize: 18,
                   color: palette.BLACK, marginLeft: 10, marginBottom: 7 }}>
                 Services Offered
               </Text>
               <View style={{ marginLeft: 10, marginBottom: 2 }} >
                 <Text style={inbox.subTitle} ellipsizeMode='tail' numberOfLines={2}>
                   {svcRequestServices}
                 </Text>
               </View>
           </View>
         </View>

         <View style={{ marginTop: 5 }}>
             <Text style={{ fontSize: 18,
                 color: palette.BLACK, marginLeft: 10 }}>
               {this.state.reviews.length} Reviews
             </Text>
         </View>

         {renderIf(this.state.reviews.length > 0)(
           <ListView
             style={{ marginTop: 10 }}
             dataSource={this.state.dataSource}
             renderRow={this.renderRow.bind(this)}
             renderSeparator={this.renderSeparator}
           />
         )}
       </View>
     </View>
    );
  }
}


MerchantReviews.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('MerchantReviews', () => MerchantReviews);
