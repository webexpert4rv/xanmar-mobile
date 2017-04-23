import React, { Component } from 'react';
import { AppRegistry, Image, View } from 'react-native';
import { NavigationActions } from 'react-navigation';
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
    fetch('http://192.168.86.214:3000/api/autoservices')
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
              realm.create('ServiceCategory', { name: category.category, services: categoryServices });
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
      console.log(JSON.stringify(userPrefs));
      if (userPrefs.length > 0) {
        if (userPrefs[0].onboarded && userPrefs[0].role === 'consumer') {
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'userNavigator' }),
            ],
          });
          this.props.navigation.dispatch(resetAction);
        } else if (userPrefs[0].onboarded && userPrefs[0].role === 'merchant') {
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'userNavigator' }),
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
        this.downloadAutoServices();
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
