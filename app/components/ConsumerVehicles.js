import React, { Component } from 'react';
import { AppRegistry, Button, Image, View, StyleSheet, Text } from 'react-native';
import { ListView } from 'realm/react-native';
import { NavigationActions } from 'react-navigation';
import realm from './realm';
import palette from '../style/palette';
import PushController from './PushController';

const vehicleIcon = require('../img/vehicle_icon.png');

export default class ConsumerVehicles extends Component {
  static navigationOptions = {
    title: 'My Vehichles',
    header: null,
    tabBarIcon:({ tintColor }) => (
      <Image
        source={profileIcon}
        style={{ width: 26, height: 26, tintColor: tintColor }}
      />
   ),
  };

  constructor(props) {
    super(props);
    this._onNotificationReceived = this._onNotificationReceived.bind(this);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const v = realm.objects('Vehicle');
    this.state = {
      dataSource: ds.cloneWithRows(v),
    };
  }

  renderRow(rowData, sectionID, rowID, highlightRow){
    const veh = 'rowData.year + " " + rowData.make + " " + rowData.model';
    return (
      <View style={styles.container}>
        <View style={styles.vehicle}>
          <Text style={styles.title}>
            {rowData.year} {rowData.make} {rowData.model}
          </Text>
          <Text style={styles.footnote}>
            Last serviced March 1, 2017
          </Text>
        </View>
        <View style={{ marginBottom: 8, marginLeft: 8, marginRight: 8, flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }} >
          <Button
            color={palette.PRIMARY_COLOR_DARK}
            onPress={() => { this.props.navigation.navigate('RequestService', {vehicle: rowData })}}
            title="Request Service"
          />
        </View>
      </View>
    );
  }

  renderSeparator(sectionID, rowID, adjacentRowHighlighted){
    return(
      <View
        key={`${sectionID}-${rowID}`}
        style={{
          height: adjacentRowHighlighted ? 4 : 1,
          backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#CCCCCC',
        }}
      />
    );
  }

  rowPressed (vehicle) {
    const { navigate } = this.props.navigation;
    navigate('ff');
  }

  _onNotificationReceived(n) {
    console.log('Notification recieved...sne to history page');
    // this.props.navigation.navigate('SvcHistory');
    // this.state = {
    //   gotoSvcHistory: true,
    // };
  }

  addVehicle() {
    const navigateAction = NavigationActions.navigate({
      routeName: 'RegisterVehicle',
      params: {},
    });

  this.props.navigation.dispatch(navigateAction);

  }

  render() {
    const { navigate } = this.props.navigation;
    if (this.state.dataSource.getRowCount() > 0) {
      return (
        <View>
          <PushController onNotificationReceived={this._onNotificationReceived} />
          <View style={{ marginRight: 10, marginTop: 20, flexDirection: 'column', alignItems: 'flex-end' }}>
            <Button
              style={{ width: 300 }}
              color={palette.PRIMARY_COLOR_DARK}
              onPress={() => this.props.navigation.navigate('SvcHistory')}
              title="Add Vechicle"
            />
          </View>
          <ListView
            style={{ marginTop: 10 }}
            dataSource={this.state.dataSource}
            renderRow={this.renderRow.bind(this)}
            renderSeparator={this.renderSeparator}
          />
        </View>
      );
    } else {
      return (
        <View>
          <PushController onNotificationReceived={this._onNotificationReceived} />
          <View style={{ marginRight: 10, marginTop: 20, flexDirection: 'column', alignItems: 'flex-end' }}>
            <Button
              style={{ width: 300 }}
              color={palette.PRIMARY_COLOR_DARK}
              onPress={() => this.props.navigation.navigate('RegisterVehicle')}
              title="Add Vechicle"
            />
          </View>
          <View>
            <Text style={{ textAlign: 'center', marginTop: 30, fontSize: 20 }}>No registered vechicles </Text>
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 100,
    backgroundColor: '#F5FCFF',
    marginLeft: 8,
    marginRight: 8,
  },
  icon: {
    width: 26,
    height: 26,
  },
  vehicle: {
    padding: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  footnote: {
    fontSize: 12,
    fontStyle: 'italic'
  },
  name: {
    fontSize: 20,
    textAlign: 'left',
    margin: 10,
  },
  desc: {
    textAlign: 'left',
    color: '#333333',
    marginBottom: 5,
    margin: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#dddddd',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    paddingVertical: 20,
  },
});

AppRegistry.registerComponent('ConsumerVehicles', () => ConsumerVehicles);
