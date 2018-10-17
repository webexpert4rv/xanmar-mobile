import React, { Component } from 'react';
import { Platform } from 'react-native';
import Icon from  'react-native-vector-icons/MaterialIcons';

class CheckBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data
    };
  }

  render() {
    let iconName;
    if (Platform.OS === 'ios') {
      iconName = this.state.data.checked ? 'check-circle' : 'radio-button-unchecked';
    } else {
      iconName = this.state.data.checked ? 'check-box' : 'check-box-outline-blank';
    }
    let color = this.props.color || '#000';

    return (
      <Icon.Button
        data={this.state.data}
        name={iconName}
        backgroundColor='rgba(0,0,0,0)'
        color={color}
        underlayColor='rgba(0,0,0,0)'
        size={20}
        iconStyle={{marginLeft: -10, marginRight: 0}}
        activeOpacity={1}
        borderRadius={5}
        onPress={this.props.onCheckBoxPressed}
      >
      </Icon.Button>
    );
  }
}

module.exports = CheckBox;
