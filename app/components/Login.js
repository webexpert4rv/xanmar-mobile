import React, { Component, PropTypes } from 'react';
import { Alert, AppRegistry,
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
import {
  PublisherBanner,
} from 'react-native-admob'
export default class Login extends Component {
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
            <Text style={onboardingStyles.headerButton}>Login</Text>
          </TouchableOpacity>
        </View>),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      showEmailError: false,
      showPwdError: false,
      email: '',
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({ handleNext: this.authenticate.bind(this) });
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

    return formValid;
  }


  showAd(){
    // Display an interstitial
    return(
        <PublisherBanner
          adSize="banner"
          validAdSizes={['mediumRectangle']}
          onAdFailedToLoad={(error) => console.log(error)}
          adUnitID="/6499/example/APIDemo/AdSizes"
          ref={el => (this._adSizesExample = el)}
        /> 
    )
  }

  authenticate() {
    if (this.validateForm()) {
      const { navigate } = this.props.navigation;
      fetch(format('{}/api/user/auth', constants.BASSE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: constants.API_KEY,
        },
        body: JSON.stringify({
          email: this.state.email.toLowerCase(),
          pwd: this.state.pwd,
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

          const uId = parseInt(responseData.profile.user_id);
          if (uId > 0) {
            this.showAd()
            //save info to UserPreference table locally
            if (responseData.profile.user_type === constants.MERCHANT_TYPE) {

              if (responseData.profile.cust_id != null) {
                realm.write(() => {
                  realm.create('UserPreference', { onboarded: true,
                    userId: responseData.profile.user_id,
                    role: constants.MERCHANT_TYPE,
                    subscriptionId: responseData.profile.sub_id,
                    customerId: responseData.profile.cust_id,
                    status: responseData.profile.status,
                    plan: responseData.profile.plan });

                  realm.create('ServiceProviderProfile',
                    { email: responseData.profile.email,
                      business_name: responseData.profile.business_name,
                      phone: responseData.profile.phone,
                      contact_name: responseData.profile.contact_name,
                      address: responseData.profile.address,
                      city: responseData.profile.city,
                      state: responseData.profile.state,
                      zip: responseData.profile.zip,
                    });
                });

                const resetAction = NavigationActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({ routeName: 'merchantTab' }),
                  ],
                });
                this.props.navigation.dispatch(resetAction);
              } else {
                realm.write(() => {
                  realm.create('UserPreference', { onboarded: true,
                    userId: responseData.profile.user_id,
                    role: constants.MERCHANT_TYPE,
                    subscriptionId: "",
                    customerId: "",
                    status: "inactive",
                    plan: "" });

                  realm.create('ServiceProviderProfile',
                    { email: responseData.profile.email,
                      business_name: responseData.profile.business_name,
                      phone: responseData.profile.phone,
                      contact_name: responseData.profile.contact_name,
                      address: responseData.profile.address,
                      city: responseData.profile.city,
                      state: responseData.profile.state,
                      zip: responseData.profile.zip,
                    });
                });
                this.props.navigation.navigate('MerchantPymt', { fromProfile: false });
              }

            } else {
              //consumer
              var hasVehicle = false;
              realm.write(() => {
                realm.create('UserPreference', { onboarded: true,
                  userId: responseData.profile.user_id,
                  role: constants.CONSUMER_TYPE,
                  deviceToken: responseData.profile.device_token,
                 });

                realm.create('ConsumerProfile',
                  { email: responseData.profile.email,
                    name: responseData.profile.name,
                    phone: responseData.profile.phone,
                  });

                  responseData.vehicles.forEach(vehicle => {
                    realm.create('Vehicle',
                      { vehicleId: vehicle.vehicle_id,
                        make: vehicle.make,
                        model: vehicle.model,
                        year: vehicle.year.toString(),
                      });
                  });

                  if (responseData.vehicles.length > 0) {
                    hasVehicle = true;
                    realm.create('CurrentVehicle',
                    { vehicleId: responseData.vehicles[0].vehicle_id,
                      make: responseData.vehicles[0].make,
                      model: responseData.vehicles[0].model,
                      year: responseData.vehicles[0].year.toString()
                    });
                  }
                    //service Request
                  responseData.serviceRequests.forEach((svcRequest) => {
                    let s = []
                    svcRequest.services.forEach((svc) => {
                      svc.services.forEach((singleSvc) => {
                        s.push(singleSvc);
                      });
                    });
                    // save request locally
                    const rSvcRequest = {
                      vehicle_id: svcRequest.vehicle_id,
                      service_request_id: svcRequest.service_request_id,
                      user_id: svcRequest.user_id,
                      service_date: new Date(svcRequest.service_date),
                      service_zip: "00000",
                      make: svcRequest.make,
                      model: svcRequest.model,
                      year: svcRequest.year,
                      comment: svcRequest.comment,
                      status: svcRequest.status,
                      services: s,
                    };
                    realm.create('ServiceRequest', rSvcRequest, true);
                  });
                });

                var resetAction;
                if (hasVehicle) {
                    resetAction = NavigationActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({ routeName: 'consumerTab' }),
                    ],
                  });
                } else {
                  resetAction = NavigationActions.navigate({
                    routeName: 'RegisterVehicle',
                    params: { onBoarding: false, userId: responseData.profile.user_id },
                  });
                }

                this.props.navigation.dispatch(resetAction);
            }

          } else {
            Alert.alert(
            'Login Error',
            'Username or password are incorrect.',
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')},
            ],
            { cancelable: false }
          )
          }
        }).catch(error => NetworkUtils.showNetworkError('Unable to login'));
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={onboardingStyles.mainContainer}>
        <View>
          <Text style={onboardingStyles.title}>Log In</Text>
        </View>
        <View style={{ flexDirection: 'column', marginTop: 20, marginLeft: 20 }}>

          {renderIf(this.state.showEmailError)(
            <Text style={formStyles.error}>{this.state.emailError}</Text>,
          )}
          <TextInput
            style={[onboardingStyles.textInput, { height: 50 }]}
            underlineColorAndroid="rgba(0,0,0,0)"
            autoCorrect={false}
            placeholder="Email"
            placeholderTextColor={palette.LIGHT_BLUE}
            onChangeText={text => this.setState({ email: text })}
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
        </View>
        <TouchableOpacity onPress={() => navigate('ForgotPassword', {email: this.state.email})}>
          <View style={{ marginTop: 20}}>
            <Text style={[onboardingStyles.title, {color:palette.LIGHT_BLUE, fontSize: 15}]}>Forgot password</Text>
          </View>
        </TouchableOpacity>
        <View style={{ marginTop: 20}}>
          <Text style={onboardingStyles.title}>Thank you for returning</Text>
        </View>
        <View style={onboardingStyles.adStyle}>
          { this.showAd() }
        </View>

      </View>
    );
  }
}

Login.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('Login', () => Login);
