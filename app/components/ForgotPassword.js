import React, { Component, PropTypes } from 'react';
import {ActivityIndicator,
        Alert, AppRegistry,
        View,
        Text,
        TextInput,
        TouchableOpacity } from 'react-native';
import { HeaderBackButton, NavigationActions } from 'react-navigation';
import renderIf from 'render-if';
import format from 'string-format';
import { formStyles, onboardingStyles, common } from '../style/style';
import realm from './realm';
import palette from '../style/palette';
import constants from '../constants/c';
import Communications from 'react-native-communications';
import * as NetworkUtils from '../utils/networkUtils';

export default class ForgotPassword extends Component {
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
      headerRight: params.isRequesting ? (
        <ActivityIndicator size="small" color={palette.LIGHT_BLUE} style={{ paddingRight: 20 }} />
      ) : (
        <View>
          <TouchableOpacity onPress={() => params.handleNext()}>
            <Text style={onboardingStyles.headerButton}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      )
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      showEmailError: false,
      email: '',
      isRequesting: false,
    };
  }

  componentDidMount() {
    const {navigation} = this.props
    this.props.navigation.setParams(
      { handleNext: this.resetpwd.bind(this),
        isRequesting: this.state.isRequesting });

    const { params = {} } = navigation.state;
    this.setState({email: params.email})
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

    return formValid;
  }

  resetpwd() {
    if (this.validateForm()) {
      const { navigation } = this.props;
      const obj = {
          email: this.state.email.toLowerCase(),
        }
      this.props.navigation.setParams({ isRequesting: true });
      fetch(format('{}/api/user/restpwd', constants.BASSE_URL), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: constants.API_KEY,
        },
        body: JSON.stringify(obj),
      })
        .then(response => {
          this.props.navigation.setParams({ isRequesting: false })
          if (response.ok) {
            return response.json()
          } else {
            throw Error(response.statusText)
          }
        })
        .then((responseData) => {
          console.log('responseData', responseData, obj)
          if (responseData.error) {
            Alert.alert(
            'Error',
            responseData.error,
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')},
            ],
            { cancelable: false }
            
          )
          } else {
            Alert.alert(
            'Success',
            'Please check email for reset password instructions',
            [
              { text: 'OK', onPress: () => navigation.goBack() },
            ],
            { cancelable: false }
          )
          }
        }).catch(error => NetworkUtils.showNetworkError('Unable to reset'));
    }
  }

  render() {
    return (
      <View style={onboardingStyles.mainContainer}>
        <View>
          <Text style={onboardingStyles.title}>Forgot password</Text>
        </View>
        <View style={{ flexDirection: 'column', marginTop: 20, marginLeft: 20 }}>

          {renderIf(this.state.showEmailError)(
            <Text style={formStyles.error}>{this.state.emailError}</Text>,
          )}
          <TextInput
            autoCapitalize='none'
            style={[onboardingStyles.textInput, { height: 50 }]}
            underlineColorAndroid="rgba(0,0,0,0)"
            autoCorrect={false}
            placeholder="Email"
            placeholderTextColor={palette.LIGHT_BLUE}
            onChangeText={text => this.setState({ email: text })}
          />
          <View style={onboardingStyles.line} />
        </View>
      </View>
    );
  }
}

ForgotPassword.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('Login', () => Login);
