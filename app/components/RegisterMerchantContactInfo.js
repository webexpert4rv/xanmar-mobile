import React, { Component, PropTypes } from 'react';
import {
  AppRegistry,
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
    };
  }

  postMerchant() {
    if (this.validateForm()) {
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
        .then(response => response.json())
        .then((responseData) => {

          const uId = responseData.service_provider_id;
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
        })
        .done();
    }
  }

  gotoServices() {
    if (this.validateForm()) {
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

  submitRequest() {
    if (this.validateForm()) {
      const svcs = this.state.currentServices;
      let serviceChecked = false;
      const servicesCategoryMap = {};
      svcs.forEach((service) => {
        if (!servicesCategoryMap[service.name]) {
          // Create an entry in the map for the category if it hasn't yet been created
          servicesCategoryMap[service.name] = [];
        }

        service.services.forEach((s) => {
          if (s.checked) {
            servicesCategoryMap[service.name].push(s);
            serviceChecked = true;
          }
        });

        if (!serviceChecked) {
          delete servicesCategoryMap[service.name];
        }
        serviceChecked = false;
      });

      const r = [];
      Object.keys(servicesCategoryMap).forEach((key) => {
        const sv = servicesCategoryMap[key];
        sv.forEach((s) => {
          r.push(s);
        });
      });

      const { state } = this.props.navigation;
      const svcRequest = {
        user_id: this.getUserId(),
        service_date: new Date(this.state.date),
        service_zip: this.state.zip,
        make: state.params.vehicle.make,
        model: state.params.vehicle.model,
        year: parseInt(state.params.vehicle.year, 10),
        services: r,
      };

      fetch(format('{}/api/consumer/service/request', constants.BASSE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: constants.API_KEY,
        },
        body: JSON.stringify(svcRequest),
      })
        .then(response => response.json())
        .then((responseData) => {
          svcRequest.service_id = responseData.service_request_id;

          // save request locally
          const rSvcRequest = {
            service_id: svcRequest.service_id,
            user_id: svcRequest.user_id,
            service_date: svcRequest.service_date,
            service_zip: svcRequest.service_zip,
            make: svcRequest.make,
            model: svcRequest.model,
            year: svcRequest.year,
          };
          realm.write(() => {
            realm.create('ServiceRequest', rSvcRequest);
          });

          // send service request events
          events.sendSvcRequestEvent(rSvcRequest);

          // reset services and categories
          const localSvc = realm.objects('Service');
          localSvc.forEach((s) => {
            realm.write(() => {
              s.checked = false;
            });
          });

          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'consumerTab' }),
            ],
          });
          this.props.navigation.dispatch(resetAction);
        }).catch((error) => {
          console.log(error);
        })
        .done();
    }
  }

  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    return (

      <View style={common.merchantContainer}>

        <View
          style={{ flex: 0.10,
            backgroundColor: palette.MERCHANT_HEADER_COLOR,
            alignSelf: 'stretch',
            height: HEIGHT,
            flexDirection: 'row',
            justifyContent: 'space-between' }}
        >
          <HeaderBackButton tintColor={palette.WHITE} onPress={() => this.goBack()} />
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.postMerchant()} >
              <Text style={common.headerLeftButton}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>


        <View style={{ flex: 0.90 }}>
          <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: palette.MERCHANT_HEADER_COLOR, height: 50 }}>
            <Text style={common.headerTitle}>
              Enter your contact information
            </Text>
          </View>
          <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 20, marginLeft: 20 }}>
            {renderIf(this.state.showNameError)(
              <Text style={formStyles.error}>Field required</Text>
            )}
            <View style={{ flexDirection: 'row', height: 50 }}>
              <View style={{ width: 100, marginTop: 10, flex: 0.5 }}>
                <Text style={onboardingStyles.label}>Name:</Text>
              </View>
              <TextInput
                style={[onboardingStyles.textInput, { height: 50, flex: 0.5 }]}
                underlineColorAndroid="rgba(0,0,0,0)"
                autoCorrect={false}
                onChangeText={text => this.setState({ contactName: text })}
              />
            </View>
            <View style={onboardingStyles.line} />
            {renderIf(this.state.showEmailError)(
              <Text style={formStyles.error}>{this.state.emailError}</Text>
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
              <Text style={formStyles.error}>Field required (must be 10 digits)</Text>
            )}
            <View style={{ flexDirection: 'row', height: 50 }}>
              <View style={{ width: 100, marginTop: 10, flex: 0.2 }}>
                <Text style={onboardingStyles.label}>Phone:</Text>
              </View>
              <TextInput
                style={[onboardingStyles.textInput, { height: 50, flex: 0.8 }]}
                underlineColorAndroid="rgba(0,0,0,0)"
                autoCorrect={false}
                keyboardType="phone-pad"
                maxLength={10}
                onChangeText={text => this.setState({ phone: text })}
              />
            </View>
            <View style={onboardingStyles.line} />
            {renderIf(this.state.pwdMismatchError || this.state.showPwdError)(
              <Text style={formStyles.error}>{this.state.pwdError}</Text>
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
              <Text style={formStyles.error}>This field required.</Text>
            )}
            <View style={{ flexDirection: 'row', height: 50 }}>
              <View style={{ width: 100, marginTop: 10, flex: 0.4 }}>
                <Text style={onboardingStyles.label}>Re-Password:</Text>
              </View>
              <TextInput
                style={[onboardingStyles.textInput, { height: 50, flex: 0.6 }]}
                underlineColorAndroid="rgba(0,0,0,0)"
                autoCorrect={false}
                secureTextEntry
                onChangeText={text => this.setState({ confirmPwd: text })}
              />
            </View>
            <View style={onboardingStyles.line} />

          </View>

          <View style={{ justifyContent: 'center', alignItems: 'center', height: 50, marginTop: 40 }}>
            <Text style={{ fontSize: 18, color: palette.WHITE, marginRight: 5 }}>
              By clicking Next, you agree to Xanmar
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 20 }}>
            <Text style={{ fontSize: 18, color: palette.LIGHT_BLUE, marginRight: 5 }}>
              Terms of Use
            </Text>
            <Text style={{ fontSize: 18, color: palette.WHITE, marginRight: 5 }}>
              and
            </Text>
            <Text style={{ fontSize: 18, color: palette.LIGHT_BLUE }}>
              Privacy Policy
            </Text>
          </View>
        </View>

      </View>


    );
  }
}

RegisterMerchantContactInfo.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('RegisterMerchantContactInfo', () => RegisterMerchantContactInfo);
