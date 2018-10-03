import React, {Component} from 'react';
import {TouchableHighlight, View, Text} from 'react-native';
import CheckBox from './CheckBox';
import realm from './realm';
import format from 'string-format';
import palette from '../style/palette';

class ServiceListSectionItem extends Component {
  constructor(props) {
    super(props);
    this._onCheckBoxPressed = this._onCheckBoxPressed.bind(this);

    this.state = {
      item: this.props.data,
      serviceEntity: this.props.svcs,
      textColor: this.props.textColor,
      lineColor: this.props.lineColor,
      iconColor: this.props.iconColor
    }
  }

  _onCheckBoxPressed() {
    const i = this.state.item;
    const mSvc = realm.objects(this.state.serviceEntity);
    const exactCat = mSvc.filtered(format('category_id == {}', i.category_id));
    if (exactCat.length > 0) {
      realm.write(() => {
        i.checked = !i.checked;
        exactCat[0].checked = i.checked;
        this.setState({
          item: i,
        });
      });
    }

    this.props.onCompletedChange(i);
  }

  render() {
    const item = this.state.item;
    const color = this.state.iconColor;
    const tColor = this.state.textColor;
    const lColor = this.state.lineColor;

    return (
      <View
        style={{ marginVertical: 10, height: 40, flexDirection: 'row',
          justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 0.5,
          borderBottomColor: lColor, marginLeft: 10 }}>
        <View style={{ marginLeft: 15, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, color: tColor }}>
            {item.name}
          </Text>
        </View>
        <View style={{ marginRight: 10, flexDirection: 'column', alignItems: 'flex-end' }}>
          <CheckBox data={item} color={color} onCheckBoxPressed={this._onCheckBoxPressed} />
        </View>
      </View>
    )
  }
}

module.exports = ServiceListSectionItem;
