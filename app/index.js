import React, { Component } from 'react';
import {
  AppRegistry,
  Button,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import registerMain from './components/registerMain';
import registerConsumer from './components/registerConsumer';
import registerAutoService from './components/registerMechanic';
import registerServicesOffered from './components/RegisterServices';
import registerVehicle from './components/RegisterVehicle';
import main from './components/MainComponent';

const AppNavigator = StackNavigator({
  First: { screen: registerMain },
  ConsumerRegister: { screen: registerConsumer },
  AutoServiceRegister: { screen: registerAutoService },
  RegisterServicesOffered: { screen: registerServicesOffered },
  RegisterVehicle: { screen: registerVehicle },
  Main: { screen: main },
});

// class xanmar extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {};
//   }
//
//   render() {
//     const { nav } = this.props.navigation;
//     return (
//       <View>
//         <Button
//           onPress={() => nav.navigate('First')}
//           title="Go to next screen"
//         />
//       </View>
//     )
//   }
// }
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center'
//   }
// });

export default AppNavigator
