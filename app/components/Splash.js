import React, { Component } from 'react';
import { AppRegistry, Image, View } from 'react-native';
import { NavigationActions } from 'react-navigation';
import format from 'string-format';
import constants from '../constants/c';
import realm from './realm';

const splashIcon = require('../img/splash_icon.png');

export default class splash extends Component {
  static navigationOptions = {
    title: 'Xanmar',
    header: {
      visible: false,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
    };
  }

  componentDidMount() {
    this.init();
  }

  downloadAutoServices() {
    fetch(format('{}/api/autoservices', constants.BASSE_URL), {
      headers: {
        Authorization: constants.API_KEY,
      },
    })
      .then(response => response.json())
      .then((responseData) => {
        responseData.categories.forEach((category) => {
          const categoryServices = [];
          category.services.forEach((service) => {
            if (service.service_id) {
              categoryServices.push(service);
            }
          });
          if (categoryServices.length > 0) {
            realm.write(() => {
              realm.create('ServiceCategory', { category_id: category.category_id, name: category.category, services: categoryServices });
            });
          }
        });
      })
      .done();
  }

  init() {
    try {
      const { navigate } = this.props.navigation;
      const userPrefs = realm.objects('UserPreference');

      if (userPrefs.length > 0) {
        if (userPrefs[0].onboarded && userPrefs[0].role === 'consumer') {
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'consumerNavigatorMain' }),
            ],
          });
          this.props.navigation.dispatch(resetAction);
        } else if (userPrefs[0].onboarded && userPrefs[0].role === 'merchant') {
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'merchantNavigatorMain' }),
            ],
          });
          this.props.navigation.dispatch(resetAction);
        } else {
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'OnBoardingNavigator' }),
            ],
          });
          this.props.navigation.dispatch(resetAction);
        }
      } else {
        const sc = realm.objects('ServiceCategory');
        if (sc.length === 0) {
          this.downloadAutoServices();
        }
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: 'OnBoardingNavigator' }),
          ],
        });
        this.props.navigation.dispatch(resetAction);
      }

    } catch (error) {
      console.log(error);
      // Error retrieving data
    }
  }
  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#6495ed' }}>
        <Image
          source={splashIcon}
        />
      </View>
    );
  }
}

AppRegistry.registerComponent('splash', () => splash);
