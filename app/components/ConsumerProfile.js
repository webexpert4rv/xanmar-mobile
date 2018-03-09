import React, { Component } from 'react';
import { Alert, AppRegistry,
        Button,
        Image,
        View,
        Platform,
        Text, TextInput, TouchableOpacity } from 'react-native';
import renderIf from 'render-if';
import { HeaderBackButton, NavigationActions } from 'react-navigation';
import { formStyles, common } from '../style/style';
import format from 'string-format';
import constants from '../constants/c';
import realm from './realm';
import palette from '../style/palette';

const profileIcon = require('../img/tabbar/profile_on.png');

export default class ConsumerProfile extends Component {
  static navigationOptions = {
    title: 'Edit Profile',
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      showEmailError: false,
      showNameError: false,
      showPhoneError: false,
    };
    this.loadProfile();
  }

  loadProfile() {
    const profile = realm.objects('ConsumerProfile');
    if (profile.length > 0) {
      this.state = {
        name: profile[0].name,
        email: profile[0].email,
        phone: profile[0].phone,
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

    // name
    if (this.state.name === undefined || this.state.name.length === 0) {
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

    return formValid;
  }

  updateProfile() {
    if (this.validateForm()) {
      const { navigate } = this.props.navigation;

      const profile = realm.objects('ConsumerProfile');
      if (profile.length > 0) {
        realm.write(() => {
          profile[0].name = this.state.name;
          profile[0].email = this.state.email;
          profile[0].phone = this.state.phone;
        });
      }

      Alert.alert(
      'Info',
      'Profile information has been updated.',
        [
          { text: 'OK' },
        ],
      { cancelable: false }
    );

      fetch(format('{}/api/user/registration', constants.BASSE_URL), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: constants.API_KEY,
        },
        body: JSON.stringify({
          email: this.state.email,
          name: this.state.name,
          phone: this.state.phone,
          user_id: this.getUserId(),
        }),
      })
        .then(response => response.json())
        .then((responseData) => {
        })
        .done();
    }
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

  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    const { navigate } = this.props.navigation;
    return (
      <View style={{ flex:1, backgroundColor: palette.DASHBOARD_GRAY }}>
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
        <View>
          <Text style={{ marginLeft: 20, textAlign: 'left', marginTop: 30, fontSize: 20 }}>Account Information</Text>
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 20, marginLeft: 20 }}>
          {renderIf(this.state.showNameError)(
            <Text style={formStyles.error}>Field required</Text>
          )}
          <TextInput
            style={{ height: 60, width: 300 }}
            value={this.state.name}
            onChangeText={text => this.setState({ name: text })}
          />
          {renderIf(this.state.showEmailError)(
            <Text style={formStyles.error}>{this.state.emailError}</Text>
          )}
          <TextInput
            style={{ height: 60, width: 300 }}
            value={this.state.email}
            onChangeText={text => this.setState({ email: text })}
          />
          {renderIf(this.state.showPhoneError)(
            <Text style={formStyles.error}>Field required (must be 10 digits)</Text>
          )}
          <TextInput
            style={{ height: 60, width: 300 }}
            value={this.state.phone}
            maxLength={10}
            keyboardType="phone-pad"
            onChangeText={text => this.setState({ phone: text })}
          />

        </View>
      </View>
    );
  }
}

AppRegistry.registerComponent('ConsumerProfile', () => ConsumerProfile);
