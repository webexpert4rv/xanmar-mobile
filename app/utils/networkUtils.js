
import { Alert, AppRegistry, Image, View, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

export const showNetworkError =(msg = 'Unable to get requested data.' ) => {
  Alert.alert(
    'Network Error',
    msg,
    [
      {text: 'OK'},
    ],
    { cancelable: false }
  )
};
