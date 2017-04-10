import React, { Component } from 'react';
import { AppRegistry, AsyncStorage, Image, View } from 'react-native';
import { NavigationActions } from 'react-navigation';

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

  init() {
    try {
      const { navigate } = this.props.navigation;
      AsyncStorage.getItem('UserId')
      .then((value) => {
        console.log('userId from storaage: '.concat(JSON.stringify(value)));
        if (value === null) {
          this.setState({ initialized: false });
        } else {
          this.setState({ initialized: true });
        }
      })
      .then(res => {
        if (this.state.initialized) {
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'userNavigator' }),
            ]
          });
          this.props.navigation.dispatch(resetAction);
        } else {
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'OnBoardingNavigator' }),
            ]
          });
          this.props.navigation.dispatch(resetAction);
          // fetch('http://192.168.86.214:3000/api/vehicles')
          //   .then(response => response.json())
          //   .then((responseData) => {
          //     this.setState({
          //       vehicles: responseData.vehicles,
          //     });
          //     const resetAction = NavigationActions.reset({
          //       index: 0,
          //       actions: [
          //         NavigationActions.navigate({ routeName: 'OnBoardingNavigator' }),
          //       ]
          //     });
          //     this.props.navigation.dispatch(resetAction);
          //   })
          //   .catch((error) => {
          //     console.log(error);
          //   });
        }
      });

      // console.log('1');
      // const value =  await AsyncStorage.getItem('@UserId:key');
      // console.log('2');
      // console.log('value: '.concat(JSON.stringify(value)));
      // if (value !== null) {
      //   // We have data!!
      //   console.log(value);
      //   console.log('3');
      //   navigate('Main');
      // } else {
      //   console.log('4');
      //   navigate('RegisterMain');
      // }
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
