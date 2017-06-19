import React, { Component } from 'react';
import { Alert,
        AppRegistry,
        Button,
        View,
        ScrollView, Text, TextInput } from 'react-native';
import renderIf from 'render-if';
import format from 'string-format';
import { formStyles } from '../style/style';
import constants from '../constants/c';
import realm from './realm';
import palette from '../style/palette';

export default class registerMerchant extends Component {
  static navigationOptions = {
    title: 'Register As Auto Service Shop',
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
      showEmailError: false,
      pwdMismatchError: false,
      showPwdError: false,
      showConfirmPwdError: false,
      showBizNameError: false,
      showNameError: false,
      showPhoneError: false,
      showAddressError: false,
      showCityError: false,
      showStateError: false,
      showZipError: false,

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
      console.log('error for email');
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

    // biz  name
    if (this.state.name === undefined || this.state.name.length === 0) {
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

  postMerchant() {
    if (this.validateForm()) {
      const { navigate } = this.props.navigation;
      fetch(format('{}/api/provider', constants.BASSE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.state.email,
          pwd: this.state.pwd,
          business: {
            name: this.state.name,
            contact_name: this.state.contactName,
            phone: this.state.phone,
            address: this.state.address,
            city: this.state.city,
            st: this.state.st,
            zip: this.state.zip,
          }
        }),
      })
        .then(response => response.json())
        .then((responseData) => {
          const uId = responseData.service_provider_id;
          realm.write(() => {
            realm.create('UserPreference', { onboarded: true, userId: uId, role: 'merchant' });
          });
          this.setState({
            userId: uId,
          });
          navigate('RegisterServicesOffered', { businessName: this.state.name, businessId: uId });
        })
        .done();
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
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
              placeholder="email"
              onChangeText={text => this.setState({ email: text })}
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
              placeholder="confirm password"
              secureTextEntry={true}
              onChangeText={text => this.setState({ confirmPwd: text })}
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
              placeholder="Business Name"
              onChangeText={text => this.setState({ name: text })}
            />
            {renderIf(this.state.showNameError)(
              <Text style={formStyles.error}>Field required</Text>
            )}
            <TextInput
              style={{ height: 60, width: 300 }}
              placeholder="contact name"
              onChangeText={text => this.setState({ contactName: text })}
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
            {renderIf(this.state.showAddressError)(
              <Text style={formStyles.error}>Field required</Text>
            )}
            <TextInput
              style={{ height: 60, width: 300 }}
              placeholder="Address"
              onChangeText={text => this.setState({ address: text })}
            />
            {renderIf(this.state.showCityError)(
              <Text style={formStyles.error}>Field required</Text>
            )}
            <TextInput
              style={{ height: 60, width: 300 }}
              placeholder="City"
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
                placeholder="State"
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
                placeholder="zip"
                onChangeText={text => this.setState({ zip: text })}
              />
            </View>
          </View>

          <View style={{ marginTop: 20, marginBottom: 10, height: 50, flexDirection: 'column', alignItems: 'center' }}>
            <Button
              style={{ width: 800 }}
              color={palette.PRIMARY_COLOR}
              onPress={() => this.postMerchant()}
              title="Select services offered"
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

AppRegistry.registerComponent('registerMerchant', () => registerMerchant);
