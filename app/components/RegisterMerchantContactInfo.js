import React, { Component, PropTypes } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppRegistry,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  View,
} from 'react-native';
import renderIf from 'render-if';
import format from 'string-format';
import { HeaderBackButton, NavigationActions } from 'react-navigation';
import { formStyles, onboardingStyles, common } from '../style/style';
import constants from '../constants/c';
import realm from './realm';
import palette from '../style/palette';
import * as events from '../broadcast/events';
import * as NetworkUtils from '../utils/networkUtils';

export default class RegisterMerchantContactInfo extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { state } = this.props.navigation;
    this.state = {
      showEmailError: false,
      pwdMismatchError: false,
      showPwdError: false,
      showConfirmPwdError: false,
      showNameError: false,
      showPhoneError: false,
      bizName: state.params.bizName,
      address: state.params.address,
      city: state.params.city,
      st: state.params.st,
      zip: state.params.zip,
      registering: false,
      userId: 0,
    };
  }

  postMerchant() {
    if (this.validateForm() && this.state.userId == 0) {
      this.setState({ registering: true });
      fetch(format('{}/api/provider', constants.BASSE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: constants.API_KEY,
        },
        body: JSON.stringify({
          email: this.state.email,
          pwd: this.state.pwd,
          business: {
            name: this.state.bizName,
            contact_name: this.state.contactName,
            phone: this.state.phone,
            address: this.state.address,
            city: this.state.city,
            st: this.state.st,
            zip: this.state.zip,
          },
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
          const uId = responseData.service_provider_id;
          if (uId === 0) {
            Alert.alert(
              'Registration Error',
              'An account already exists with that email address.',
              [
                {text: 'OK'},
              ],
              { cancelable: false }
            );
            this.setState({ registering: false });
          } else {
            realm.write(() => {
              realm.create('UserPreference',
                { onboarded: true,
                  userId: uId,
                  role: 'merchant',
                });

                realm.create('ServiceProviderProfile',
                  { contact_name: this.state.contactName,
                    email: this.state.email,
                    pwd: this.state.pwd,
                    phone: this.state.phone,
                    business_name: this.state.bizName,
                    address: this.state.address,
                    city: this.state.city,
                    state: this.state.st,
                    zip: this.state.zip,
                  });
            });
            this.setState({
              userId: uId,
            });
            this.gotoServices(uId);
          }

        }).catch(error => NetworkUtils.showNetworkError('Unable to update information'));
    } else {
      this.gotoServices(this.state.userId);
    }
  }

  gotoServices() {
    if (this.validateForm()) {
      this.setState({ registering: false });
      const { navigate } = this.props.navigation;
      navigate('RegisterServicesOffered');
    }
  }

  goBack() {
    const { goBack } = this.props.navigation;
    goBack();
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

    // pwd
    if (this.state.pwd === undefined) {
      this.setState({ pwdError: 'Field required.', showPwdError: true });
      formValid = false;
    } else {
      this.setState({ showPwdError: false });
    }

    // confirm pwd
    if (this.state.confirmPwd === undefined) {
      this.setState({ showConfirmPwdError: true });
      formValid = false;
    } else {
      this.setState({ showConfirmPwdError: false });
    }

    // match
    if (this.state.pwd !== this.state.confirmPwd) {
      this.setState({ pwdError: 'Passwords do not match.', pwdMismatchError: true });
      formValid = false;
    } else {
      this.setState({ pwdMismatchError: false });
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

    return formValid;
  }

  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;

    const keyBoardProps = {
      keyboardVerticalOffset: 5,
    };
    if (Platform.OS === 'ios') {
      keyBoardProps.behavior = 'padding';
    }

    return (

      <View style={common.merchantContainer}>

        <View
          style={{ flex: 0.15,
            backgroundColor: palette.MERCHANT_HEADER_COLOR,
            alignSelf: 'stretch',
            height: HEIGHT,
            flexDirection: 'row',
            justifyContent: 'space-between' }}
        >
          <HeaderBackButton tintColor={palette.WHITE} onPress={() => this.goBack()} />
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            {renderIf(this.state.registering)(
              <ActivityIndicator size="small" color={palette.LIGHT_BLUE} style={{ paddingRight: 20 }} />
            )}
            {renderIf(!this.state.registering)(
              <TouchableOpacity onPress={() => this.postMerchant()} >
                <Text style={common.headerLeftButton}>Next</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>


        <KeyboardAvoidingView {...keyBoardProps} style={{ flex: 0.90 }}>
          <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: palette.MERCHANT_HEADER_COLOR, height: 50 }}>
            <Text style={common.headerTitle}>
              Enter your contact information
            </Text>
          </View>
          <View style={{ flexDirection: 'column', marginTop: 20, marginLeft: 20 }}>
            {renderIf(this.state.showNameError)(
              <Text style={formStyles.error}>Field required</Text>
            )}
            <TextInput
              style={[onboardingStyles.textInput, { height: 50 }]}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={false}
              placeholder="Name"
              placeholderTextColor={palette.LIGHT_BLUE}
              onChangeText={text => this.setState({ contactName: text })}
            />
            <View style={onboardingStyles.line} />
            {renderIf(this.state.showEmailError)(
              <Text style={formStyles.error}>{this.state.emailError}</Text>
            )}
            <TextInput
              style={[onboardingStyles.textInput, { height: 50 }]}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={false}
              keyboardType='email-address'
              autoCapitalize='none'
              placeholder="Email"
              placeholderTextColor={palette.LIGHT_BLUE}
              onChangeText={text => this.setState({ email: text })}
            />
            <View style={onboardingStyles.line} />
            {renderIf(this.state.showPhoneError)(
              <Text style={formStyles.error}>Field required (must be 10 digits)</Text>
            )}
            <TextInput
              style={[onboardingStyles.textInput, { height: 50 }]}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={false}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="Phone"
              placeholderTextColor={palette.LIGHT_BLUE}
              onChangeText={text => this.setState({ phone: text })}
            />
            <View style={onboardingStyles.line} />
            {renderIf(this.state.pwdMismatchError || this.state.showPwdError)(
              <Text style={formStyles.error}>{this.state.pwdError}</Text>
            )}
            <TextInput
              style={[onboardingStyles.textInput, { height: 50 }]}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={false}
              secureTextEntry
              placeholder="Password"
              placeholderTextColor={palette.LIGHT_BLUE}
              onChangeText={text => this.setState({ pwd: text })}
            />
            <View style={onboardingStyles.line} />
            {renderIf(this.state.showConfirmPwdError)(
              <Text style={formStyles.error}>This field required.</Text>
            )}
            <TextInput
              style={[onboardingStyles.textInput, { height: 50 }]}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={false}
              secureTextEntry
              placeholder="Confirm password"
              placeholderTextColor={palette.LIGHT_BLUE}
              onChangeText={text => this.setState({ confirmPwd: text })}
            />
            <View style={onboardingStyles.line} />

          </View>

        </KeyboardAvoidingView>
      </View>


    );
  }
}

RegisterMerchantContactInfo.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('RegisterMerchantContactInfo', () => RegisterMerchantContactInfo);
