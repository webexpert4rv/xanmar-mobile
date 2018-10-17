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
import renderIf from 'render-if';
import ExpandableList from 'react-native-expandable-section-list';
import { common, serviceRequest, formStyles } from '../style/style';
import { NavigationActions } from 'react-navigation';
import { ListView } from 'realm/react-native';
import format from 'string-format';
import constants from '../constants/c';
import realm from './realm';
import palette from '../style/palette';
import * as events from '../broadcast/events';
import * as NetworkUtils from '../utils/networkUtils';


export default class ConsumerRequestZip extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { state } = this.props.navigation;
    this.state = {
      svcsRequested: state.params.svcsRequested,
      showSvcZipError: false,
    };
  }

  componentDidMount() {
    const { state } = this.props.navigation;
    this.state = {
      svcsRequested: state.params.svcsRequested,
    };
  }

  validateForm() {
    let formValid = true;

    // service zip
    if (this.state.zip === undefined || this.state.zip.length < 5) {
      this.setState({ showSvcZipError: true });
      formValid = false;
    } else {
      this.setState({ showSvcZipError: false });
    }

    return formValid;
  }

  gotoDate() {
    const { navigate } = this.props.navigation;
    if (this.validateForm()) {
      navigate('RequestServiceDate', { svcsRequested: this.state.svcsRequested, zip: this.state.zip });
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
            <TouchableOpacity onPress={() => this.gotoDate()} >
              <Text style={common.headerLeftButton}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ marginTop: 40 }}>
          <Text style={serviceRequest.title}>Where do you need services?</Text>
        </View>
        <View>
          <Text style={serviceRequest.subTitle}>Enter your zip code</Text>
        </View>
        {renderIf(this.state.showSvcZipError)(
          <View style={[common.center, { marginTop: 15 }]}>
            <Text style={formStyles.error}>Zip Field required (must be 5 digits)</Text>
          </View>
        )}
        <TextInput
          style={serviceRequest.textInput}
          underlineColorAndroid="rgba(0,0,0,0)"
          autoCorrect={false}
          keyboardType="numeric"
          maxLength={5}
          onChangeText={text => this.setState({ zip: text })}
        />
        <View style={serviceRequest.line} />
      </View>
    );
  }
}


ConsumerRequestZip.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('ConsumerRequestZip', () => ConsumerRequestZip);
