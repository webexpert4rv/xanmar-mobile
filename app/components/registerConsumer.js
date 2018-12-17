import React, { Component, PropTypes } from 'react';
import { ActivityIndicator, AppRegistry,
        Alert,
        KeyboardAvoidingView,
        Platform,
        View,
        Text,
        TextInput,
        TouchableOpacity } from 'react-native';
import renderIf from 'render-if';
import format from 'string-format';
import { formStyles, onboardingStyles, common } from '../style/style';
import realm from './realm';
import palette from '../style/palette';
import constants from '../constants/c';
import * as NetworkUtils from '../utils/networkUtils';
import {trackWithProperties, trackableEvents} from '../utils/analytics'

export default class RegisterConsumer extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerStyle: common.header,
      headerTitleStyle: {
        color: palette.WHITE,
      },
      headerBackTitleStyle: {
        color: palette.WHITE,
      },
      headerTintColor: palette.WHITE,
      headerRight: params.isRegistering ? (
        <ActivityIndicator size="small" color={palette.LIGHT_BLUE} style={{ paddingRight: 20 }} />
      ) : (
        <View>
          <TouchableOpacity onPress={() => params.handleNext()}>
            <Text style={onboardingStyles.headerButton}>Next</Text>
          </TouchableOpacity>
        </View>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      vehicles: [],
      models: [],
      showEmailError: false,
      pwdMismatchError: false,
      showNameError: false,
      showPhoneError: false,
      showPwdError: false,
      showConfirmPwdError: false,
      isRegistering: false,
      userId: 0,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams(
      { handleNext: this.registerUser.bind(this),
        isRegistering: this.state.isRegistering });
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

  getUserId() {
    let uId = 0;
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      uId = userPrefs[0].userId;
    }
    return uId;
  }

  registerUser() {
    const { navigate } = this.props.navigation;
    if (this.validateForm() && this.state.userId == 0) {
      this.props.navigation.setParams({ isRegistering: true });
      fetch(format('{}/api/user/registration', constants.BASSE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: constants.API_KEY,
        },
        body: JSON.stringify({
          email: this.state.email,
          pwd: this.state.pwd,
          name: this.state.name,
          phone: this.state.phone,
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
          const uId = responseData.user_id;
          this.props.navigation.setParams({ isRegistering: false });
          if (uId === 0) {
            Alert.alert(
              'Registration Error',
              'An account already exists with that email address.',
              [
                {text: 'OK'},
              ],
              { cancelable: false }
            );
          } else {
            realm.write(() => {
              realm.create('UserPreference', { onboarded: true, userId: uId, role: 'consumer' });
              realm.create('ConsumerProfile',
                { name: this.state.name,
                  email: this.state.email,
                  pwd: this.state.pwd,
                  phone: this.state.phone,
                });
            });
            trackWithProperties(trackableEvents.CREATE_ACCOUNT_CONSUMER, { type: 'consumer'})
            this.setState({
              userId: uId,
            });
            navigate('RegisterVehicle',
              {
                userId: uId,
                onBoarding: true,
              }
            );
          }
        }).catch(error => { 
            console.log("error", error)
            NetworkUtils.showNetworkError('Unable to register.')}
          );
    } else {
      navigate('RegisterVehicle',
      {
        userId: this.state.userId,
        onBoarding: true,
      }
    );
    }
  }

  render() {

    const keyBoardProps = {
      keyboardVerticalOffset: 5,
    };
    if (Platform.OS === 'ios') {
      keyBoardProps.behavior = 'padding';
    }

    return (
      <KeyboardAvoidingView {...keyBoardProps} style={onboardingStyles.mainContainer}>
        <View>
          <Text style={onboardingStyles.title}>Create an Account</Text>
        </View>
        <View style={{ flexDirection: 'column', marginTop: 20, marginLeft: 20 }}>
          {renderIf(this.state.showNameError)(
            <Text style={formStyles.error}>Field required</Text>,
          )}
          <TextInput
            style={[onboardingStyles.textInput, { height: 50 }]}
            underlineColorAndroid="rgba(0,0,0,0)"
            autoCapitalize='words'
            autoCorrect={false}
            placeholder="Name"
            placeholderTextColor={palette.LIGHT_BLUE}
            onChangeText={text => this.setState({ name: text })}
          />
          <View style={onboardingStyles.line} />
          {renderIf(this.state.showEmailError)(
            <Text style={formStyles.error}>{this.state.emailError}</Text>,
          )}
          <TextInput
            style={[onboardingStyles.textInput, { height: 50 }]}
            keyboardType='email-address'
            autoCapitalize='none'
            underlineColorAndroid="rgba(0,0,0,0)"
            autoCorrect={false}
            placeholder="Email"
            placeholderTextColor={palette.LIGHT_BLUE}
            onChangeText={text => this.setState({ email: text })}
          />
          <View style={onboardingStyles.line} />
          {renderIf(this.state.showPhoneError)(
            <Text style={formStyles.error}>Field required (must be 10 digits)</Text>,
          )}
          <TextInput
            style={[onboardingStyles.textInput, { height: 50 }]}
            keyboardType="phone-pad"
            underlineColorAndroid="rgba(0,0,0,0)"
            autoCorrect={false}
            maxLength={10}
            placeholder="Phone"
            placeholderTextColor={palette.LIGHT_BLUE}
            onChangeText={text => this.setState({ phone: text })}
          />
          <View style={onboardingStyles.line} />
          {renderIf(this.state.pwdMismatchError || this.state.showPwdError)(
            <Text style={formStyles.error}>{this.state.pwdError}</Text>,
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
            <Text style={formStyles.error}>This field required.</Text>,
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
    );
  }
}

RegisterConsumer.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('RegisterConsumer', () => RegisterConsumer);
