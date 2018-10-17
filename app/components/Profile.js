import React, { Component, PropTypes } from 'react';
import { Alert, AppRegistry, Button, Image, Linking, Platform, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ListView } from 'realm/react-native';
import { NavigationActions } from 'react-navigation';
import format from 'string-format';
import renderIf from 'render-if';
import { Dropdown } from 'react-native-material-dropdown';
import { common, serviceRequest, dashboard } from '../style/style';
import realm from './realm';
import palette from '../style/palette';
import constants from '../constants/c';
import * as accountEvents from '../broadcast/events';
import Communications from 'react-native-communications';
import * as NetworkUtils from '../utils/networkUtils';

const profileIcon = require('../img/tabbar/profile_on.png');

export default class Profile extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Profile',
      header: null,
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={profileIcon}
          style={{ width: 26, height: 26, tintColor }}
        />
      ),
    };
  };

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this._updateData();
  }

  componentDidMount(){
    accountEvents.getMerchantAccountChangeEvents().subscribe((value) => {
        this.setState({
          accountActive: value,
        });
    });
    this._sub = this.props.navigation.addListener('didFocus', this._updateData);
  }

  _updateData = () => {
    const userType = this.determinUserType();
    const profileInfo = this.getNameAndEmail(userType);

    const userPrefs = realm.objects('UserPreference');

    // console.log(JSON.stringify(userPrefs));
    let status;
    let statusState = false;
    let plan;
    if (userPrefs.length > 0) {
      status = userPrefs[0].status;
      plan = userPrefs[0].plan;
      if (status === 'active') {
        statusState = true;
      }
    }

    this.setState({
      userType: userType,
      name: profileInfo.name,
      email: profileInfo.email,
      phone: profileInfo.phone,
      accountActive: statusState,
    });
  };

  componentWillUnmount() {
    this._sub.remove();
  }

  determinUserType() {
    let uType = "";
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      uType = userPrefs[0].role;
    }
    return uType;
  }

  getNameAndEmail(uType) {
    let n, e, p;
    if (uType == "consumer") {
      const cp = realm.objects('ConsumerProfile');
      if (cp.length > 0) {
        n = cp[0].name;
        e = cp[0].email;
        p = cp[0].phone;
      }
    } else {
      const spp = realm.objects('ServiceProviderProfile');
      if (spp.length > 0) {
        n = spp[0].business_name;
        e = spp[0].email;
        p = spp[0].phone;
      }
    }
    return { name: n, email: e, phone: p};
  }

  getUserId() {
    let uId = 0;
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      uId = userPrefs[0].userId;
    }
    return uId;
  }

  logout() {

    //clear local data
    let userPrefs = realm.objects('UserPreference');
    realm.write(() => {
      realm.delete(userPrefs);
    });

    let currentVehicle = realm.objects('CurrentVehicle');
    realm.write(() => {
      realm.delete(currentVehicle);
    });

    let svcRequest = realm.objects('ServiceRequest');
    realm.write(() => {
      realm.delete(svcRequest);
    });

    if (this.state.userType === constants.CONSUMER_TYPE) {
      let consumerProfile = realm.objects('ConsumerProfile');
      let vehicle = realm.objects('Vehicle');
      realm.write(() => {
        realm.delete(consumerProfile);
        realm.delete(vehicle);
      });
    } else {
      let serviceProviderProfile = realm.objects('ServiceProviderProfile');
      realm.write(() => {
        realm.delete(serviceProviderProfile);
      });

      let serviceRequestNonVisibility = realm.objects('ServiceRequestNonVisibility');
      realm.write(() => {
        realm.delete(serviceRequestNonVisibility);
      });
    }

    const resetAction = NavigationActions.reset({
      index: 0, key:null,
      actions: [
        NavigationActions.navigate({ routeName: 'Splash' }),
      ],
    });
    this.props.navigation.dispatch(resetAction);
  }

  editProfile() {
    if (this.state.userType === 'consumer') {
      this.props.navigation.navigate('ConsumerProfile');
    } else {
      this.props.navigation.navigate('MerchantProfile');
    }
  }

  subscriptionClick() {
    if (this.state.userType === constants.MERCHANT_TYPE) {
      this.props.navigation.navigate('MerchantPymt', { fromProfile: true });
    }
  }

  gotoTandC() {
    Linking.openURL('https://www.xanmarauto.com/terms.html')
  }

  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    const { navigate } = this.props.navigation;
    let phone;
    if (this.state.phone === undefined) {
      phone = "";
    } else {
      phone = this.state.phone.replace(/(\d{3})(\d{3})(\d{4})/,"($1)$2-$3");
    }
    let subscriptionText = 'Pay for Xanmar Auto Subscription';
    if (this.state.accountActive) {
      subscriptionText = "Edit Subscription";
    }

    return (

      <View style={common.dashboardContainer}>
        <View
          style={{ backgroundColor: palette.HEADER_BLUE,
            alignSelf: 'stretch',
            height: HEIGHT,
            flexDirection: 'row',
            justifyContent: 'space-between' }}
        >
          <View style={{ width: 50 }} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={common.headerTitle}>
              Profile
            </Text>
          </View>
          <View>
            <Text style={common.blueAddHeaderButton}> </Text>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
          <View style={{ marginTop:40, marginBottom:80 }}>
            <Text style={{ textAlign: 'center', fontSize:17 }}>{this.state.name}</Text>
            <Text style={{ textAlign: 'center', fontSize:17 }}>{this.state.email}</Text>
            <Text style={{ textAlign: 'center', fontSize:17 }}>{phone}</Text>
          </View>

          <TouchableOpacity style={{ height:50, alignSelf: 'stretch', justifyContent: 'center', backgroundColor:palette.WHITE}} onPress={() => this.editProfile()} >
            <View style={{ backgroundColor:palette.WHITE }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} >
                <View style={{ justifyContent: 'center'}}>
                    <Text style={{ fontSize:17, marginLeft: 15 }}>Edit</Text>
                </View>
                <View>
                  <Text style={{ fontSize:30, marginRight: 20, color: palette.GRAY }}>
                    &rsaquo;
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          {renderIf(this.state.userType === constants.MERCHANT_TYPE)(
            <View style={{ height:50, alignSelf: 'stretch', justifyContent: 'center', backgroundColor:palette.WHITE}}>
              <View style={dashboard.line} />
              <TouchableOpacity style={{ height:50, alignSelf: 'stretch', justifyContent: 'center', backgroundColor:palette.WHITE}} onPress={() => this.subscriptionClick()} >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} >
                  <View style={{ height:50, alignSelf: 'stretch', justifyContent: 'center', backgroundColor:palette.WHITE}}>
                      <Text style={{ marginLeft: 15, fontSize:17 }}>{subscriptionText}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize:30, marginRight: 20, color: palette.GRAY }}>
                      &rsaquo;
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
          <View style={dashboard.line} />
          <TouchableOpacity style={{ height:50, alignSelf: 'stretch', justifyContent: 'center', backgroundColor:palette.WHITE}} onPress={() => this.logout()} >
            <View style={{ height:50, alignSelf: 'stretch', justifyContent: 'center', backgroundColor:palette.WHITE}}>
                <Text style={{ marginLeft: 15, fontSize:17 }}>Logout</Text>
            </View>
          </TouchableOpacity>
          <View style={dashboard.line} />
          <TouchableOpacity style={{ height:50, alignSelf: 'stretch', justifyContent: 'center', backgroundColor:palette.WHITE}}
          onPress={() => Communications.email(['support@xanmar.com'],null,null,'Feedback or help','')}>
            <View style={{ height:50, alignSelf: 'stretch', justifyContent: 'center', backgroundColor:palette.WHITE}}>
                <Text style={{ marginLeft: 15, fontSize:17 }}>Contact us for feedback or need help?</Text>
            </View>
          </TouchableOpacity>
          <View style={dashboard.line} />
          <TouchableOpacity style={{ height:50, alignSelf: 'stretch', justifyContent: 'center', backgroundColor:palette.WHITE}}
          onPress={() => this.gotoTandC()}>
            <View style={{ height:50, alignSelf: 'stretch', justifyContent: 'center', backgroundColor:palette.WHITE}}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} >
                  <View style={{ justifyContent: 'center'}}>
                      <Text style={{ fontSize:17, marginLeft: 15 }}>Terms and Conditions</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize:30, marginRight: 20, color: palette.GRAY }}>
                      &rsaquo;
                    </Text>
                  </View>
                </View>
            </View>
          </TouchableOpacity>
          <View style={dashboard.line} />
        </View>

      </View>

    );
  }
}

Profile.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('Profile', () => Profile);
