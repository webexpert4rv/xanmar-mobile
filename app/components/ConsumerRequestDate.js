import React, { Component, PropTypes } from 'react';
import {
  AppRegistry,
  Text,
  TextInput,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { HeaderBackButton } from 'react-navigation';
import DatePicker from 'react-native-datepicker';
import renderIf from 'render-if';
import { common, serviceRequest, formStyles } from '../style/style';
import { NavigationActions } from 'react-navigation';
import format from 'string-format';
import constants from '../constants/c';
import realm from './realm';
import palette from '../style/palette';
import * as events from '../broadcast/events';
import * as NetworkUtils from '../utils/networkUtils';


export default class ConsumerRequestDate extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { state } = this.props.navigation;
    this.state = {
      zip: state.params.zip,
      showSvcDateError: false,
    };
  }



  validateForm() {
    let formValid = true;

    // service date
    if (this.state.date === undefined) {
      this.setState({ showSvcDateError: true });
      formValid = false;
    } else {
      this.setState({ showSvcDateError: false });
    }
    return formValid;
  }

  gotoPhoto() {
    const { navigate } = this.props.navigation;
    if (this.validateForm()) {
      navigate('RequestServicePhoto',
        {
          // svcsRequested: this.state.svcsRequested,
          zip: this.state.zip,
          svcDate: this.state.date,
        }
      );
    }
  }

  goBack() {
    const { goBack } = this.props.navigation;
    goBack();
  }

  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    return (

      <View style={common.consumerSvcRequestContainer}>

        <View
          style={{
            backgroundColor: palette.HEADER_BLUE,
            alignSelf: 'stretch',
            height: HEIGHT,
            flexDirection: 'row',
            justifyContent: 'space-between' }}
        >
          <HeaderBackButton tintColor={palette.WHITE} onPress={() => this.goBack()} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={common.headerTitle}>
              Request a New Service
            </Text>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.gotoPhoto()} >
              <Text style={common.headerLeftButton}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ marginTop: 40 }}>
          <Text style={serviceRequest.title}>When do you need</Text>
        </View>
        <View style={{ marginTop: 5 }}>
          <Text style={serviceRequest.title}>the service to start?</Text>
        </View>
        <View>
          <Text style={serviceRequest.subTitle}>Enter your desired service date</Text>
        </View>
        <View style={{ marginTop: 30 }}>
          {renderIf(this.state.showSvcDateError)(
            <View style={common.center}>
              <Text style={formStyles.error}>Date requird</Text>
            </View>
          )}
          <DatePicker
            style={{ marginLeft: 10, width: 400 }}
            date={this.state.date}
            mode="date"
            placeholder="choose date"
            format="MM/DD/YYYY"
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            showIcon={false}
            onDateChange={(date) => { this.setState({ date: date})}}
            customStyles={{
              dateInput: {
                borderWidth: 0,
              },
              placeholderText: {
                fontSize: 20,
                color: palette.WHITE,
                fontStyle: 'italic',
              },
              dateText: {
                color: palette.WHITE,
                fontSize: 20,
              },
            }}
          />
        </View>
        <View style={serviceRequest.line} />
      </View>
    );
  }
}


ConsumerRequestDate.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('ConsumerRequestDate', () => ConsumerRequestDate);
