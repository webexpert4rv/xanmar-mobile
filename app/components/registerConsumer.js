import React, { Component } from 'react';
import { AppRegistry,
        Button,
        View,
        Text, TextInput } from 'react-native';
import renderIf from 'render-if';
import format from 'string-format';
import { formStyles } from '../style/style';
import realm from './realm';
import palette from '../style/palette';
import constants from '../constants/c';

export default class registerConsumer extends Component {
  static navigationOptions = {
    title: 'Register Consumer',
    headerStyle: {
      backgroundColor: palette.PRIMARY_COLOR,
    },
    headerTitleStyle: {
      color: palette.WHITE,
    },
    headerBackTitleStyle: {
      color: palette.WHITE,
    },
    headerTintColor: palette.WHITE,
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
          });
          this.setState({
            userId: uId,
          });
          navigate('RegisterVehicle');
        })
        .done();
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <View>
          <Text style={{ marginLeft: 20, textAlign: 'left', marginTop: 30, fontSize: 20 }}>Account Information</Text>
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 20, marginLeft: 20 }}>
          {renderIf(this.state.showNameError)(
            <Text style={formStyles.error}>Field required</Text>
          )}
          <TextInput
            style={{ height: 60, width: 300 }}
            placeholder="name"
            onChangeText={text => this.setState({ name: text })}
          />
          {renderIf(this.state.showEmailError)(
            <Text style={formStyles.error}>{this.state.emailError}</Text>
          )}
          <TextInput
            style={{ height: 60, width: 300 }}
            placeholder="email"
            onChangeText={text => this.setState({ email: text })}
          />
          {renderIf(this.state.showPhoneError)(
            <Text style={formStyles.error}>Field required (must be 10 digits)</Text>
          )}
          <TextInput
            style={{ height: 60, width: 300 }}
            keyboardType="phone-pad"
            placeholder="contact number"
            maxLength={10}
            onChangeText={text => this.setState({ phone: text })}
          />
          {renderIf(this.state.pwdMismatchError || this.state.showPwdError)(
            <Text style={formStyles.error}>{this.state.pwdError}</Text>
          )}
          <TextInput
            style={{ height: 60, width: 300 }}
            placeholder="password"
            secureTextEntry={true}
            onChangeText={text => this.setState({ pwd: text })}
          />
          {renderIf(this.state.showConfirmPwdError)(
            <Text style={formStyles.error}>This field required.</Text>
          )}
          <TextInput
            style={{ height: 60, width: 300 }}
            secureTextEntry={true}
            placeholder="confirm password"
            onChangeText={text => this.setState({ confirmPwd: text })}
          />
        </View>
        <View style={{ marginTop: 50, marginBottom: 10, height: 50, flexDirection: 'column', alignItems: 'center' }}>
          <Button
            style={{ width: 800 }}
            color={palette.PRIMARY_COLOR_DARK}
            onPress={() => this.registerUser()}
            title="Create Account"
          />
        </View>
      </View>
    );
  }
}

AppRegistry.registerComponent('registerConsumer', () => registerConsumer);
