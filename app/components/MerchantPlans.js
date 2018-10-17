import React, { Component, PropTypes } from 'react';
import { AppRegistry, Image, View, Text, TouchableOpacity, Platform } from 'react-native';
import { HeaderBackButton, NavigationActions } from 'react-navigation';
import format from 'string-format';
import { onboardingStyles, common, subscriptions } from '../style/style';
import stripe from 'tipsi-stripe';
import palette from '../style/palette';
import constants from '../constants/c';
import realm from './realm';
import * as events from '../broadcast/events';

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

export default class MerchantPlans extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    // const { state } = this.props.navigation;
    this.state = {
      plan1Style: subscriptions.unselected,
      plan2Style: subscriptions.unselected,
      plan3Style: subscriptions.unselected,
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

  planSelected(plan) {
    if (plan === 1) {
      this.setState({
        plan1Style: subscriptions.selected,
        plan2Style: subscriptions.unselected,
        plan3Style: subscriptions.unselected,
        planSelected:constants.SUBSCRIPTION_1,
     })
    }
    if (plan === 2) {
      this.setState({
        plan1Style: subscriptions.unselected,
        plan2Style: subscriptions.selected,
        plan3Style: subscriptions.unselected,
        planSelected:constants.SUBSCRIPTION_2,
     })
    }
    if (plan === 3) {
      this.setState({
        plan1Style: subscriptions.unselected,
        plan2Style: subscriptions.unselected,
        plan3Style: subscriptions.selected,
        planSelected:constants.SUBSCRIPTION_3,
     })
    }
  }

  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    const { navigate } = this.props.navigation;
    const SELECTED_COLOR = 'red';

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
              Merchant Plans
            </Text>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.gotoContact()} >
              <Text style={common.headerLeftButton}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ justifyContent: 'flex-start', alignItems: 'center'}}>
          <Text style={{ marginTop: 10, color: palette.DARK_BLUE, fontSize: 22 }}>
            Select a plan
          </Text>
        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 20,
        }}>

          <TouchableOpacity style={this.state.plan1Style}
          onPress={() => this.planSelected(1)} >
            <View style={this.state.plan1Style}>
              <Text style={{color: palette.WHITE}}>Free</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={this.state.plan2Style}
           onPress={() => this.planSelected(2)} >
            <View style={this.state.plan2Style}>
              <Text style={{color: palette.WHITE}}>3 Months</Text>
              <Text style={{color: palette.WHITE}}>$9.99/month</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={this.state.plan3Style}
           onPress={() => this.planSelected(3)} >
            <View style={this.state.plan3Style}>
            <Text style={{color: palette.WHITE}}>Yearly</Text>
            <Text style={{color: palette.WHITE}}>99.00 /year</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{
          flexDirection: 'row',marginLeft:20, marginRight:20,
        }}>
          <View style={subscriptions.bullet} />
          <Text style={{ color: palette.DARK_BLUE,
            marginLeft:8, fontSize:15, fontWeight: 'bold' }}>
            Recieve unlimtied service requests in your area.
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
            Unlimted messaging to learn about each service request.
          </Text>
        </View>

      </View>
    );
  }
}

MerchantPlans.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('MerchantPlans', () => MerchantPlans);
