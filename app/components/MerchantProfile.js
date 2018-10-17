import React, { Component } from 'react';
import { Alert,
        AppRegistry,
        Button,
        View,
        Image,
        Picker,
        Platform,
        ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import renderIf from 'render-if';
import { HeaderBackButton, NavigationActions } from 'react-navigation';
import { formStyles, common } from '../style/style';
import format from 'string-format';
import constants from '../constants/c';
import realm from './realm';
import palette from '../style/palette';
import * as NetworkUtils from '../utils/networkUtils';

const profileIcon = require('../img/tabbar/profile_on.png');

export default class MerchantProfile extends Component {
  static navigationOptions = {
    title: 'Edit Profile',
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      showEmailError: false,
      showBizNameError: false,
      showNameError: false,
      showPhoneError: false,
      showAddressError: false,
      showCityError: false,
      showStateError: false,
      showZipError: false,
    };
    this.loadProfile();
  }

  loadProfile() {
    const profile = realm.objects('ServiceProviderProfile');

    if (profile.length > 0) {
      this.state = {
        businessName: profile[0].business_name,
        email: profile[0].email,
        phone: profile[0].phone,
        contactName: profile[0].contact_name,
        address: profile[0].address,
        city: profile[0].city,
        st: profile[0].state,
        zip: profile[0].zip,
      };
    }
  }

  validateForm() {
    let formValid = true;
    // email
    const re = /.+@.+/;
    const validEmail = re.test(this.state.email);
    if (validEmail) {
      this.setState({ showEmailError: false });
    } else {
      this.setState({ emailError: 'invalid email.', showEmailError: true });
      formValid = false;
    }

    // biz  name
    if (this.state.businessName === undefined || this.state.businessName.length === 0) {
      this.setState({ showBizNameError: true });
      formValid = false;
    } else {
      this.setState({ showBizNameError: false });
    }

    // contanct  name
    if (this.state.contactName === undefined || this.state.contactName.length === 0) {
      this.setState({ showNameError: true });
      formValid = false;
    } else {
      this.setState({ showNameError: false });
    }

    // phone
    if (this.state.phone === undefined || this.state.phone.length < 10) {
      this.setState({ showPhoneError: true });
      formValid = false;
    } else {
      this.setState({ showPhoneError: false });
    }

    // address
    if (this.state.address === undefined || this.state.address.length === 0) {
      this.setState({ showAddressError: true });
      formValid = false;
    } else {
      this.setState({ showAddressError: false });
    }

    // city
    if (this.state.city === undefined || this.state.city.length === 0) {
      this.setState({ showCityError: true });
      formValid = false;
    } else {
      this.setState({ showCityError: false });
    }

    // state
    if (this.state.st === undefined || this.state.st.length === 0) {
      this.setState({ showStateError: true });
      formValid = false;
    } else {
      this.setState({ showStateError: false });
    }

    // zip
    if (this.state.zip === undefined || this.state.zip.length < 5) {
      this.setState({ showZipError: true });
      formValid = false;
    } else {
      this.setState({ showZipError: false });
    }
    return formValid;
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

  updateProfile() {

    if (this.validateForm()) {
      const profile = realm.objects('ServiceProviderProfile');
      if (profile.length > 0) {
        realm.write(() => {
          profile[0].email = this.state.email;
          profile[0].business_name = this.state.businessName;
          profile[0].phone = this.state.phone;
          profile[0].contact_name = this.state.contactName;
          profile[0].address = this.state.address;
          profile[0].city = this.state.city;
          profile[0].state = this.state.st;
          profile[0].zip = this.state.zip;
        });
      }

      Alert.alert(
      'Info',
      'Profile information has been updated.',
        [
          { text: 'OK', onPress: () => this.goBack() },
        ],
      { cancelable: false }
    );

    const { navigate } = this.props.navigation;
    fetch(format('{}/api/provider', constants.BASSE_URL), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: constants.API_KEY,
      },
      body: JSON.stringify({
        service_provider_id: this.getUserId(),
        email: this.state.email,
        pwd: this.state.pwd,
        business: {
          name: this.state.businessName,
          contact_name: this.state.contactName,
          phone: this.state.phone,
          address: this.state.address,
          city: this.state.city,
          st: this.state.st,
          zip: this.state.zip,
        }
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
      }).catch(error => NetworkUtils.showNetworkError("Unable to update profile"));
    }
  }

  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    const { navigate } = this.props.navigation;
    return (
      <View style={{ flex: 1, backgroundColor: palette.DASHBOARD_GRAY }}>
        <View
          style={{ backgroundColor: palette.HEADER_BLUE,
            alignSelf: 'stretch',
            height: HEIGHT,
            flexDirection: 'row',
            justifyContent: 'space-between' }}
        >
          <HeaderBackButton tintColor={palette.WHITE} onPress={() => this.goBack()} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={common.headerTitle}>
              Edit Profile
            </Text>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.updateProfile()} >
              <Text style={common.headerLeftButton}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView>
        <View>
          <Text style={{ marginLeft: 20, textAlign: 'left', marginTop: 30, fontSize: 20 }}>Account </Text>
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 20, marginLeft: 20 }}>
          {renderIf(this.state.showEmailError)(
            <Text style={formStyles.error}>{this.state.emailError}</Text>
          )}
          <TextInput
            style={{ height: 60, width: 300 }}
            value={this.state.email}
            onChangeText={text => this.setState({ email: text })}
          />
        </View>
        <View>
          <Text style={{ marginLeft: 20, textAlign: 'left', marginTop: 30, fontSize: 20 }}>Business Information </Text>
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 20, marginLeft: 20 }}>
          {renderIf(this.state.showBizNameError)(
            <Text style={formStyles.error}>Field required</Text>
          )}
          <TextInput
            style={{ height: 60, width: 300 }}
            value={this.state.businessName}
            onChangeText={text => this.setState({ businessName: text })}
          />
          {renderIf(this.state.showNameError)(
            <Text style={formStyles.error}>Field required</Text>
          )}
          <TextInput
            style={{ height: 60, width: 300 }}
            value={this.state.contactName}
            onChangeText={text => this.setState({ contactName: text })}
          />
          {renderIf(this.state.showPhoneError)(
            <Text style={formStyles.error}>Field required (must be 10 digits)</Text>
          )}
          <TextInput
            style={{ height: 60, width: 300 }}
            keyboardType="phone-pad"
            value={this.state.phone}
            maxLength={10}
            onChangeText={text => this.setState({ phone: text })}
          />
          {renderIf(this.state.showAddressError)(
            <Text style={formStyles.error}>Field required</Text>
          )}
          <TextInput
            style={{ height: 60, width: 300 }}
            value={this.state.address}
            onChangeText={text => this.setState({ address: text })}
          />
          {renderIf(this.state.showCityError)(
            <Text style={formStyles.error}>Field required</Text>
          )}
          <TextInput
            style={{ height: 60, width: 300 }}
            value={this.state.city}
            onChangeText={text => this.setState({ city: text })}
          />
        </View>

        <View style={{ flexDirection: 'row', marginTop: 20, marginLeft: 20 }}>
          <View>
            {renderIf(this.state.showStateError)(
              <Text style={formStyles.error}>Field required</Text>
            )}
            <TextInput
              style={{ height: 60, width: 100 }}
              value={this.state.st}
              onChangeText={text => this.setState({ st: text })}
            />
          </View>
          <View>
            {renderIf(this.state.showZipError)(
              <Text style={formStyles.error}>Field required (must be 5 digits)</Text>
            )}
            <TextInput
              style={{ height: 60, width: 100 }}
              keyboardType="numeric"
              maxLength={5}
              value={this.state.zip}
              onChangeText={text => this.setState({ zip: text })}
            />
          </View>
        </View>
        </ScrollView>
      </View>
    );
  }
}

AppRegistry.registerComponent('MerchantProfile', () => MerchantProfile);
