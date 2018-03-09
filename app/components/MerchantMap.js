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
import palette from '../style/palette';
import Mapbox from '@mapbox/react-native-mapbox-gl';

const emailIcon = require('../img/mail.png');
const phoneIcon = require('../img/call.png');

Mapbox.setAccessToken('pk.eyJ1IjoiNXhsIiwiYSI6ImNqOXdia2xjZDF1aGIydnBvc3oyaDduemcifQ.RtHbVUIOb-M02BVPDecV6Q');

export default class MerchantMap extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { state } = this.props.navigation;
    this.state = {
      lat: state.params.bid.lat,
      lng: state.params.bid.lng,
      mapLabel: state.params.bid.business_name+ '\n' + state.params.bid.address,
    };
  }

  componentDidMount() {

  }

  goBack() {
    const { goBack } = this.props.navigation;
    goBack();
  }

  renderAnnotations () {
    return (
      <Mapbox.PointAnnotation
        key='pointAnnotation'
        id='pointAnnotation'
        title='my title'
        selected={true}
        coordinate={[parseFloat(this.state.lng), parseFloat(this.state.lat)]}>
        <Mapbox.Callout title={this.state.mapLabel} />
      </Mapbox.PointAnnotation>
    )
  }


  render() {
    const { state } = this.props.navigation;
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;

    return (
     <View style={{ backgroundColor: palette.WHITE, flex: 1 }}>
       <View style={{ flex: 1 }}>
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
               Location
             </Text>
           </View>
           <View style={{ justifyContent: 'center', alignItems: 'center' }}>
             <TouchableOpacity style={{ marginRight: 10 }}>
               <Text style={common.headerTitle}></Text>
             </TouchableOpacity>
           </View>
         </View>
         <Mapbox.MapView
             styleURL={Mapbox.StyleURL.Street}
             zoomLevel={14}
             centerCoordinate={[parseFloat(this.state.lng), parseFloat(this.state.lat)]} //lng, lat
             style={{ flex:1 }}>
             {this.renderAnnotations()}
         </Mapbox.MapView>
       </View>
     </View>
    );
  }
}


MerchantMap.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('MerchantMap', () => MerchantMap);
