import React, {Component} from 'react';
import {TouchableHighlight, View, Text, TextInput, TouchableOpacity} from 'react-native';
import { common, reviewPopup } from '../style/style';
import palette from '../style/palette';

class ServiceRequestMessagePopup extends Component {
  constructor(props) {
    super(props);
    // this._onCheckBoxPressed = this._onCheckBoxPressed.bind(this);
    this.state = {
      comment: "",
    }
  }

  componentWillReceiveProps(props) {
    // this.setState({
    //   item: props.data
    // });
  }

  postMessage() {
    //need to call the callback
    this.props.onSendClick(this.state.comment);
  }

  render() {
    return (
      <View style={reviewPopup.container}>
        <View style={{ flex: 0.10, backgroundColor: palette.MERCHANT_HEADER_COLOR,  borderTopLeftRadius: 10,
            borderTopRightRadius: 10}}>
            <View style={{ marginLeft: 35, marginBottom: 2, marginRight: 10 }} >
              <Text style={{ textAlign: 'center', marginTop: 10, color: palette.WHITE, fontWeight: 'bold', fontSize: 17 }}>
                Send a message
              </Text>
            </View>
        </View>
        <View style={{ flex: 0.80, backgroundColor: palette.WHITE}}>
         <View style={{ marginTop: 10 }}>
            <TextInput
              style={{ marginLeft:10, marginTop:20, width: 280, height: 240, backgroundColor: palette.WHITE }}
              placeholder='Your message'
              placeholderTextColor={ palette.GRAY }
              fontSize={20}
              textAlignVertical={'top'}
              multiline
              numberOfLines={5}
              blurOnSubmit={false}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={false}
              editable
              onChangeText={(txt) => {
                this.setState({ comment: txt });
              }}
              value={this.state.comment}
              onSubmitEditing={() => {
                if (!this.state.comment.endsWith('\n')) {
                  let comment = this.state.comment;
                  comment = comment + "\n";
                  this.setState({ comment })
                }
              }}
            />
         </View>
        </View>
        <View style={{ flex: 0.10, backgroundColor: palette.LIGHT_BLUE, alignItems: 'center',
        justifyContent: 'center',borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
          <TouchableOpacity onPress={() => this.postMessage()}>
            <Text style={{ fontSize: 18, textAlign: 'center', color: palette.WHITE }}>
              Send message
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

module.exports = ServiceRequestMessagePopup;
