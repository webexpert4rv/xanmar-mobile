import React, { Component, PropTypes } from 'react';
import { AppRegistry,
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
      headerRight: (
        <View>
          <TouchableOpacity onPress={() => params.handleNext()}>
            <Text style={onboardingStyles.headerButton}>Next</Text>
          </TouchableOpacity>
        </View>),
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
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({ handleNext: this.registerUser.bind(this) });
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

  registerUser() {
    if (this.validateForm()) {
      const { navigate } = this.props.navigation;
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
        .then(response => response.json())
        .then((responseData) => {
          const uId = responseData.user_id;
          realm.write(() => {
            realm.create('UserPreference', { onboarded: true, userId: uId, role: 'consumer' });
            realm.create('ConsumerProfile',
              { name: this.state.name,
                email: this.state.email,
                pwd: this.state.pwd,
                phone: this.state.phone,
              });
          });
          this.setState({
            userId: uId,
          });
          navigate('RegisterVehicle',
            {
              userId: uId,
              onBoarding: true,
            }
          );
        })
        .done();
    }
  }

  render() {
    return (
      <View style={onboardingStyles.mainContainer}>
        <View>
          <Text style={onboardingStyles.title}>Create an Account</Text>
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 20, marginLeft: 20 }}>
          {renderIf(this.state.showNameError)(
            <Text style={formStyles.error}>Field required</Text>,
          )}
          <View style={{ flexDirection: 'row', height: 50 }}>
            <View style={{ width: 100, marginTop: 10, flex: 0.2 }}>
              <Text style={onboardingStyles.label}>Name:</Text>
            </View>
            <TextInput
              style={[onboardingStyles.textInput, { height: 50, flex: 0.8 }]}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={false}
              onChangeText={text => this.setState({ name: text })}
            />
          </View>
          <View style={onboardingStyles.line} />
          {renderIf(this.state.showEmailError)(
            <Text style={formStyles.error}>{this.state.emailError}</Text>,
          )}
          <View style={{ flexDirection: 'row', height: 50 }}>
            <View style={{ width: 100, marginTop: 10, flex: 0.2 }}>
              <Text style={onboardingStyles.label}>Email:</Text>
            </View>
            <TextInput
              style={[onboardingStyles.textInput, { height: 50, flex: 0.8 }]}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={false}
              onChangeText={text => this.setState({ email: text })}
            />
          </View>
          <View style={onboardingStyles.line} />
          {renderIf(this.state.showPhoneError)(
            <Text style={formStyles.error}>Field required (must be 10 digits)</Text>,
          )}
          <View style={{ flexDirection: 'row', height: 50 }}>
            <View style={{ width: 100, marginTop: 10, flex: 0.2 }}>
              <Text style={onboardingStyles.label}>Phone:</Text>
            </View>
            <TextInput
              style={[onboardingStyles.textInput, { height: 50, flex: 0.8 }]}
              keyboardType="phone-pad"
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={false}
              maxLength={10}
              onChangeText={text => this.setState({ phone: text })}
            />
          </View>
          <View style={onboardingStyles.line} />
          {renderIf(this.state.pwdMismatchError || this.state.showPwdError)(
            <Text style={formStyles.error}>{this.state.pwdError}</Text>,
          )}
          <View style={{ flexDirection: 'row', height: 50 }}>
            <View style={{ width: 100, marginTop: 10, flex: 0.3 }}>
              <Text style={onboardingStyles.label}>Password:</Text>
            </View>
            <TextInput
              style={[onboardingStyles.textInput, { height: 50, flex: 0.7 }]}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={false}
              secureTextEntry
              onChangeText={text => this.setState({ pwd: text })}
            />
          </View>
          <View style={onboardingStyles.line} />
          {renderIf(this.state.showConfirmPwdError)(
            <Text style={formStyles.error}>This field required.</Text>,
          )}
          <View style={{ flexDirection: 'row', height: 50 }}>
            <View style={{ width: 200, marginTop: 10, flex: 0.6 }}>
              <Text style={onboardingStyles.label}>Re-enter Password:</Text>
            </View>
            <TextInput
              style={[onboardingStyles.textInput, { height: 50, flex: 0.4 }]}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={false}
              secureTextEntry
              onChangeText={text => this.setState({ confirmPwd: text })}
            />
          </View>
          <View style={onboardingStyles.line} />
        </View>
      </View>
    );
  }
}

RegisterConsumer.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('RegisterConsumer', () => RegisterConsumer);
