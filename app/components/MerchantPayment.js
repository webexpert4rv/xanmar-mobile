import React, { Component, PropTypes } from 'react';
import { AsyncStorage, ActivityIndicator, Alert, AppRegistry, Linking, Image, View, ScrollView, Text, TouchableOpacity, Platform } from 'react-native';
import { HeaderBackButton, NavigationActions } from 'react-navigation';
import format from 'string-format';
import { onboardingStyles, common, subscriptions } from '../style/style';
import stripe from 'tipsi-stripe';
import palette from '../style/palette';
import constants from '../constants/c';
import realm from './realm';
import * as events from '../broadcast/events';
import renderIf from 'render-if';
import * as NetworkUtils from '../utils/networkUtils';

stripe.init({
  publishableKey: constants.STRIPE_KEY,
});

const theme = {
  primaryBackgroundColor: palette.HEADER_BLUE,
  secondaryBackgroundColor: palette.HEADER_BLUE,
  primaryForegroundColor: palette.WHITE,
  secondaryForegroundColor: palette.LIGHT_BLUE,
  accentColor: palette.STATUS_ORANGE,
  errorColor: palette.ERROR_COLOR
};

export default class MerchantPayment extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    const { state } = this.props.navigation;

    const userPrefs = realm.objects('UserPreference');
    this.getServiceProviderCount();

    // console.log(JSON.stringify(userPrefs));
    let status;
    let statusState = false;
    let plan = '';
    let subscription1Style = subscriptions.unselected;
    let subscription2Style = subscriptions.unselected;
    let subscription3Style = subscriptions.unselected;


    if (userPrefs.length > 0) {
      status = userPrefs[0].status;
      plan = userPrefs[0].plan;
      if (status === 'active') {
        statusState = true;
      }
    }

    console.log('Plan --->');
    console.log(plan);

    if (plan === constants.SUBSCRIPTION_1 || plan === constants.SUBSCRIPTION_TRIAL_1) {
      subscription1Style = subscriptions.selected;
    } else if (plan === constants.SUBSCRIPTION_2) {
      subscription2Style = subscriptions.selected;
    } else if (plan === constants.SUBSCRIPTION_3) {
      subscription3Style = subscriptions.selected;
    }

    let subscriptionWording = 'Finish Signup'
    if (state.params.fromProfile && (plan === constants.SUBSCRIPTION_1 || plan === constants.SUBSCRIPTION_TRIAL_1)) {
      subscriptionWording = ''
    }

    if (statusState) {
      subscriptionWording = "Cancel Subscription";
    }

    this.state = {
      fromProfile: state.params.fromProfile,
      plan1Style: subscription1Style,
      plan2Style: subscription2Style,
      plan3Style: subscription3Style,
      accountActive: statusState,
      planSelected: plan,
      currentPlan: plan,
      subscriptionText: subscriptionWording,
      registering: false,
    };
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

  getEmail() {
    let name = 'noemail@onfile.com';
    const spp = realm.objects('ServiceProviderProfile');
    if (spp.length > 0) {
      name = spp[0].email;
    }
    return name;
  }

  showCCForm() {
    const options = {
      smsAutofillDisabled: true,
      requiredBillingAddressFields: 'zip', // or 'full'
    };
    stripe.paymentRequestWithCardForm(options)
      .then(response => {

        this.setState({
          registering: true,
        });

        const userPrefs = realm.objects('UserPreference');
        if (userPrefs.length > 0) {
          const custId = userPrefs[0].customerId
        }

        //post merchant metadata
        fetch(format('{}/api/provider/metadata', constants.BASSE_URL), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: constants.API_KEY,
          },
          body: JSON.stringify({
            service_provider_id: this.getUserId(),
            email: this.getEmail(),
            token: response.tokenId,
            plan: this.state.planSelected,
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

            const userPrefs = realm.objects('UserPreference');
            if (userPrefs.length > 0) {
              realm.write(() => {
                userPrefs[0].subscriptionId = responseData.subscription_id;
                userPrefs[0].customerId = responseData.customer_id;
                userPrefs[0].plan = this.state.planSelected;
                userPrefs[0].status = 'active';
              });
            }

            if (this.state.fromProfile) {
              events.sendMerchantAccountChangeEvent(true);
              this.goBack();
            } else {
              //reset nav
              const resetAction = NavigationActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({ routeName: 'merchantTab' }),
                ],
              });
              this.props.navigation.dispatch(resetAction);
            }
          }).catch(error => NetworkUtils.showNetworkError('Unable to finish setup'));


      })
      .catch(error => {
        // Handle error
        console.log(error);
      });
  }

  planSelected(plan) {
    if (plan === 1) {

      let wording = 'Finish Signup'
      if (this.state.fromProfile) {
        wording = ''
      }

      let plan1Subscription;
      if (this.state.svcProviderCount > 100) {
        plan1Subscription = constants.SUBSCRIPTION_1;
      } else {
        plan1Subscription = constants.SUBSCRIPTION_TRIAL_1;
      }
      console.log("plan subscription --->");
      console.log(plan1Subscription);
      
      this.setState({
        plan1Style: subscriptions.selected,
        plan2Style: subscriptions.unselected,
        plan3Style: subscriptions.unselected,
        planSelected:plan1Subscription,
        subscriptionText: wording,
      });
    }
    if (plan === 2) {
      if (this.state.currentPlan === constants.SUBSCRIPTION_2 && this.state.accountActive) {
        wording = 'Cancel Subscription';
      } else {
        wording = 'Add credit card information';
      }
      this.setState({
        plan1Style: subscriptions.unselected,
        plan2Style: subscriptions.selected,
        plan3Style: subscriptions.unselected,
        planSelected:constants.SUBSCRIPTION_2,
        subscriptionText: wording,
     })
    }
    if (plan === 3) {
      if (this.state.currentPlan === constants.SUBSCRIPTION_3 && this.state.accountActive) {
        wording = 'Cancel Subscription';
      } else {
        wording = 'Add credit card information';
      }
      this.setState({
        plan1Style: subscriptions.unselected,
        plan2Style: subscriptions.unselected,
        plan3Style: subscriptions.selected,
        planSelected:constants.SUBSCRIPTION_3,
        subscriptionText: wording,
     })
    }
  }

  subscriptionClick() {
    if (this.state.planSelected === '') {
      Alert.alert(
        'Error',
        'You must select a plan',
        [
          {text: 'Ok'},
        ],
        { cancelable: false }
      );
    } else if (this.state.accountActive) {
      this.confirmCancelSubscription();
    } else if (this.state.fromProfile && (this.state.planSelected === constants.SUBSCRIPTION_1 || this.state.planSelected === constants.SUBSCRIPTION_TRIAL_1)) {
      //do nothing
    } else {
      if (this.state.planSelected === constants.SUBSCRIPTION_1 || this.state.planSelected === constants.SUBSCRIPTION_TRIAL_1) {
        this.setState({
          registering: true,
        });
        //post merchant metadata
        fetch(format('{}/api/provider/metadata', constants.BASSE_URL), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: constants.API_KEY,
          },
          body: JSON.stringify({
            service_provider_id: this.getUserId(),
            email: this.getEmail(),
            token: '',
            plan: this.state.planSelected,
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

            const userPrefs = realm.objects('UserPreference');
            if (userPrefs.length > 0) {
              realm.write(() => {
                userPrefs[0].subscriptionId = responseData.subscription_id;
                userPrefs[0].customerId = responseData.customer_id;
                userPrefs[0].plan = this.state.planSelected;
              });
            }

            if (this.state.fromProfile) {
              events.sendMerchantAccountChangeEvent(true);
              this.goBack();
            } else {
              //reset nav
              const resetAction = NavigationActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({ routeName: 'merchantTab' }),
                ],
              });
              this.props.navigation.dispatch(resetAction);
            }
          }).catch(error => NetworkUtils.showNetworkError('Unable to process request'));

      } else {
        this.showCCForm();
      }

    }
  }

  cancelSubscription() {
    fetch(format('{}/api/provider/subscription/{}/{}', constants.BASSE_URL, this.getUserId()), {
      method: 'DELETE',
      headers: {
        Authorization: constants.API_KEY,
      },
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw Error(response.statusText)
        }
      })
      .then((responseData) => {

        const userPrefs = realm.objects('UserPreference');
        if (userPrefs.length > 0) {
          realm.write(() => {
            userPrefs[0].status = 'canceled';
          });
        }

        // console.log(JSON.stringify(responseData));
        Alert.alert(
          'Cancel Subscription',
          'Subscription canceled succesfully',
          [
            {text: 'Ok', onPress: () => this.setState({ accountActive: false,subscriptionText: 'Add credit card information' })},
          ],
          { cancelable: false }
        );
      }).catch(error => NetworkUtils.showNetworkError('Error canceling subcription, please contact us at support@xanmar.com'));

  }
  confirmCancelSubscription() {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription, you will no longer be able to receive services request in your area.',
      [
        {text: 'Yes, I want to cancel', onPress: () => this.cancelSubscription()},
        {text: 'No'},
      ],
      { cancelable: false }
    );
  }

  getServiceProviderCount = async () => {
    try {
      const value = await AsyncStorage.getItem(constants.SVC_PROVIDER_COUNT_KEY);
      if (value !== null) {
        //return value;

        this.setState({
          svcProviderCount: value,
        });

        console.log(value);
      }
     } catch (error) {
       // Error retrieving data
     }
  }

  gotoTandC() {
    Linking.openURL('https://www.xanmarauto.com/terms.html')
  }

  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    const { navigate } = this.props.navigation;
    let subscriptionText = 'Add credit card information';
    let freePlanType;
    let freePlanTypeSubtitle;
    

    return (
      <View style={common.dashboardContainer}>
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
              Select A Plan
            </Text>
          </View>
          <View>
            <Text style={common.blueAddHeaderButton}> </Text>
          </View>
        </View>

        {renderIf(this.state.registering)(
          <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 8 }}>Finalizing account registration.</Text>
          </View>
        )}
        {renderIf(!this.state.registering)(
          <ScrollView>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 20,
            }}>

              <TouchableOpacity style={this.state.plan1Style}
              onPress={() => this.planSelected(1)} >
                  {renderIf(this.state.svcProviderCount > 100)(
                    <View style={this.state.plan1Style}>
                      <Text style={{color: palette.WHITE, fontWeight: 'bold'}}>BASIC</Text>
                      <Text style={{color: palette.WHITE, marginTop: 2 }}>5 bids/month</Text>
                      <Text style={{color: palette.WHITE}}></Text>
                      <Text style={{color: palette.WHITE}}>FREE</Text>
                    </View>
                  )}
                  {renderIf(this.state.svcProviderCount < 100)(
                    <View style={this.state.plan1Style}>
                    <Text style={{color: palette.WHITE, fontWeight: 'bold'}}>PREMIER</Text>
                    <Text style={{color: palette.WHITE, marginTop: 2 }}>Membership</Text>
                    <Text style={{color: palette.WHITE}}>3 Month Trial</Text>
                    <Text style={{color: palette.WHITE}}>FREE</Text>
                  </View>
                  )}
              </TouchableOpacity>
              <TouchableOpacity style={this.state.plan2Style}
               onPress={() => this.planSelected(2)} >
                <View style={this.state.plan2Style}>
                  <Text style={{color: palette.WHITE, fontWeight: 'bold'}}>PREMIER</Text>
                  <Text style={{color: palette.WHITE, marginTop: 2}}>Membership</Text>
                  <Text style={{color: palette.WHITE}}></Text>
                  <Text style={{color: palette.WHITE, textDecorationLine: 'line-through'}}>$24.99/month</Text>
                  <Text style={{color: palette.WHITE}}>$9.99/month</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={this.state.plan3Style}
               onPress={() => this.planSelected(3)} >
                <View style={this.state.plan3Style}>
                <Text style={{color: palette.WHITE, fontWeight: 'bold'}}>PREMIER</Text>
                <Text style={{color: palette.WHITE, marginTop: 2}}>Membership</Text>
                <Text style={{color: palette.WHITE}}></Text>
                <Text style={{color: palette.WHITE}}>99.98 /year</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ justifyContent: 'flex-start', alignItems: 'center'}}>
              <Text style={{ color: palette.DECLINE_RED, marginBottom: 10, fontSize:15 }}>
                Paid plans include the following:
              </Text>
            </View>
            <View style={{
              flexDirection: 'row',marginLeft:20, marginRight:20,
            }}>
              <View style={subscriptions.bullet} />
              <Text style={{ color: palette.DARK_BLUE,
                marginLeft:8, fontSize:15, fontWeight: 'bold' }}>
                Recieve unlimited service requests in your area.
              </Text>
            </View>
            <View style={{
              flexDirection: 'row',marginLeft:20, marginTop:20, marginRight:20
            }}>
              <View style={subscriptions.bullet} />
              <Text style={{ color: palette.DARK_BLUE,
                marginLeft:8, fontSize:15, fontWeight: 'bold' }}>
                Unlmited bids for service request.
              </Text>
            </View>
            <View style={{
              flexDirection: 'row',marginLeft:20, marginTop:20, marginRight:20
            }}>
              <View style={subscriptions.bullet} />
              <Text style={{ color: palette.DARK_BLUE,
                marginLeft:8, fontSize:15, fontWeight: 'bold' }}>
                Ability to message potential customer to learn about each service request posted in your area.
              </Text>
            </View>
            <View style={{
              flexDirection: 'row',marginLeft:20, marginTop:20, marginRight:20
            }}>
              <View style={subscriptions.bullet} />
              <Text style={{ color: palette.DARK_BLUE,
                marginLeft:8, fontSize:15, fontWeight: 'bold' }}>
                Rating system to help you stand out above the crowd.
              </Text>
            </View>
            <View style={{
              flexDirection: 'row',marginLeft:20, marginTop:20, marginRight:20
            }}>
              <View style={subscriptions.bullet} />
                <View>
                  <Text style={{ color: palette.DECLINE_RED,
                    marginLeft:8, fontSize:15, fontWeight: 'bold' }}>
                    Money back guarantee!
                  </Text>
                  <Text style={{ color: palette.DARK_BLUE,
                    marginLeft:8, fontSize:15, fontWeight: 'bold' }}>
                    We guarantee to increase your business or your money back!
                  </Text>
                </View>
            </View>
            <View style={{
              flexDirection: 'row',marginLeft:20, marginTop:20, marginRight:20
            }}>
              <View style={subscriptions.bullet} />
                <View>
                  <Text style={{ color: palette.DARK_BLUE,
                    marginLeft:8, fontSize:15, fontWeight: 'bold' }}>
                    Receive a Xanmar Auto App Certificate
                  </Text>
                  <Text style={{ color: palette.DECLINE_RED,
                    marginLeft:8, fontSize:12 }}>
                    Research has shown that when properly displayed this certificate increases consumer confidence in your business
                  </Text>
                </View>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 15 }}>
              <TouchableOpacity style={{ height:50, alignSelf: 'stretch', justifyContent: 'center', backgroundColor:palette.WHITE}}
              onPress={() => this.subscriptionClick()} >
                <View style={{ height:50, alignSelf: 'stretch', justifyContent: 'center', backgroundColor:palette.WHITE}}>
                    <Text style={{ marginLeft: 15, fontSize:17 }}>{this.state.subscriptionText}</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ justifyContent: 'flex-start', alignItems: 'center', marginTop:40 }}>
              <TouchableOpacity onPress={() => this.gotoTandC()} >
                <Text style={{ fontSize: 18, color: palette.DARK_BLUE }}>Terms and Conditions</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        )}


        </View>

    );
  }
}

MerchantPayment.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('MerchantPayment', () => MerchantPayment);
