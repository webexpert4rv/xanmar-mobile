import React, { Component, PropTypes } from 'react';
import {
  AppRegistry,
  Image,
  Text,
  TextInput,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import format from 'string-format';
import { HeaderBackButton, NavigationActions } from 'react-navigation';
import { common, serviceRequest } from '../style/style';
import ImagePicker from 'react-native-image-picker';
import constants from '../constants/c';
import realm from './realm';
import palette from '../style/palette';
import * as events from '../broadcast/events';

export default class ConsumerRequestPhoto extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { state } = this.props.navigation;
    this.state = {
      zip: state.params.zip,
      svcDate: state.params.svcDate,
      photo: null,
    };
  }

  goBack() {
    const { goBack } = this.props.navigation;
    goBack();
  }

  gotoComment() {
    const { navigate } = this.props.navigation;
    navigate('RequestServiceComment',
      {
        // svcsRequested: this.state.svcsRequested,
        zip: this.state.zip,
        svcDate: this.state.svcDate,
        photo: this.state.photo,
      }
    );
  }

  showPhotoPicker() {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true
      }
    };

    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled photo picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        let source = { uri: response.uri };
        // You can also display the image using data:
        //let source = { uri: 'data:image/jpeg;base64,' + response.data };
        this.setState({
          photo: source
        });
      }
    });
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
              Add Photo
            </Text>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.gotoComment()} >
              <Text style={common.headerLeftButton}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ marginTop: 40 }}>
          <Text style={serviceRequest.title}>Add photo to this</Text>
        </View>
        <View style={{ marginTop: 5 }}>
          <Text style={serviceRequest.title}>service request?</Text>
        </View>
        <View style={{ marginTop: 10 }}>
          <View style={{ backgroundColor: palette.LIGHT_BLUE, alignItems: 'center', height: 50, margin: 30,
          justifyContent: 'center',borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderTopLeftRadius:10, borderTopRightRadius: 10 }}>
            <TouchableOpacity onPress={() => this.showPhotoPicker()}>
              <Text style={{ fontSize: 18, textAlign: 'center', color: palette.WHITE }}>
                + Add photo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        { this.state.photo === null ? <TouchableOpacity onPress={() => this.gotoComment()}>
        <Text style={serviceRequest.subTitle}>Skip</Text></TouchableOpacity> :
          <View style={{ alignItems: 'center' }}>
            <Image style={{ width:150, height:150 }} source={this.state.photo} />
          </View>
          }
      </View>
    );
  }
}


ConsumerRequestPhoto.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('ConsumerRequestPhoto', () => ConsumerRequestPhoto);
