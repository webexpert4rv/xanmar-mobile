import React, {Component} from 'react';
import {TouchableHighlight, View, Text} from 'react-native';
import CheckBox from './CheckBox';
import realm from './realm';

class ServiceItem extends Component {
  constructor(props) {
    super(props);
    this._onCheckBoxPressed = this._onCheckBoxPressed.bind(this);
    this.state = {
      item: this.props.data
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      item: props.data
    });
  }

  _onCheckBoxPressed() {

    let svc;
    realm.write(() => {
      const i = this.state.item;
      console.log(JSON.stringify(i));
      i.checked = !i.checked;
      this.setState({
        item: i,
      });
      svc = realm.create('Service', i, true);
    });

    // console.log('onCheckBoxPressed')
    // console.log(JSON.stringify(i));
    this.props.onCompletedChange(svc);
  }

  render() {
    const item = this.state.item;
    const color = '#6495ed';
    return (
      <View style={{flexDirection: 'row', alignItems: 'center', padding: 1}}>
        <CheckBox data={item} color={color} onCheckBoxPressed={this._onCheckBoxPressed}></CheckBox>
        <Text key={item.service_id}> {item.name} </Text>
      </View>
    )
  }
}

module.exports = ServiceItem;
