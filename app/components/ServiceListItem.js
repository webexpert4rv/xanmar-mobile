import React, {Component} from 'react';
import {TouchableHighlight, View, Text} from 'react-native';
import CheckBox from './CheckBox';
import realm from './realm';
import palette from '../style/palette';

class ServiceListItem extends Component {
  constructor(props) {
    super(props);
    this._onCheckBoxPressed = this._onCheckBoxPressed.bind(this);
    this.state = {
      item: this.props.data,
      textColor: this.props.textColor,
      lineColor: this.props.lineColor,
      iconColor: this.props.iconColor
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      item: props.data
    });
  }

  _onCheckBoxPressed() {
    realm.write(() => {
      const i = this.state.item;
      i.checked = !i.checked;
      this.setState({
        item: i,
      });

      this.props.onCompletedChange(i);
    });
  }

  render() {
    const item = this.state.item;
    const color = this.state.iconColor;
    const tColor = this.state.textColor;
    const lColor = this.state.lineColor;
    return (
      <View style={{ borderBottomWidth: 0.5, borderBottomColor: lColor, marginLeft: 10 }}>
        <View style={{ flex: 1, flexDirection: 'row', marginTop: 10, marginLeft: 30 }}>

          <View style={{ marginTop: 10, marginRight:10, width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: palette.GRAY }} />

          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 20, color: tColor }}>
                {item.name}
              </Text>
            </View>
            <View style={{ marginRight: 10, flexDirection: 'column', alignItems: 'flex-end' }}>
              <CheckBox data={item} color={color} onCheckBoxPressed={this._onCheckBoxPressed} />
            </View>
          </View>

        </View>

      </View>

    )
  }
}

module.exports = ServiceListItem;
