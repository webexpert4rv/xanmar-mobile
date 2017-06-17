import React, { Component } from 'react';
import { AppRegistry, Button, DeviceEventEmitter, Image, View, StyleSheet, Text, TouchableHighlight } from 'react-native';
import { ListView } from 'realm/react-native';
import format from 'string-format';
import realm from './realm';
import constants from '../constants/c';
import df from 'dateformat';

const svcHistoryIcon = require('../img/svc_history_icon.png');

export default class ConsumerSvcHistory extends Component {
  static navigationOptions = {
    title: 'Service Request',
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
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const v = realm.objects('ServiceRequest');
    this.state = {
      dataSource: ds.cloneWithRows(v),
    };
  }



  loadSvcRequests() {
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const v = realm.objects('ServiceRequest');
    this.state = {
      dataSource: ds.cloneWithRows(v),
    };
  }

  componentDidMount() {
    //this.fetchData();
  }

  getUserId() {
    let uId = 0;
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      uId = userPrefs[0].userId;
    }
    return uId;
  }

  fetchData() {
    fetch(format('{}/api/user/bids/{}', constants.BASSE_URL, this.getUserId()))
      .then(response => response.json())
      .then((responseData) => {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.setState({
          dataSource: ds.cloneWithRows(responseData.bids),
          isLoading: false,
        });
      })
      .done();
  }

  renderRow(rowData, sectionID, rowID, highlightRow){
    console.log('Service Request RowData');
    console.log(JSON.stringify(rowData));
    const sd = df(rowData.service_date, 'dddd mmmm dS, yyyy');
    //const buttonText = format('{} Bid(s)', rowData.service_bids.length);
    return(
      <View style={styles.container}>
        <View style={styles.vehicle}>
          <Text style={styles.title}>
            {rowData.year} {rowData.make} {rowData.model}
          </Text>
          <Text>
             Service Date: {sd}
          </Text>
        </View>
        <View style={{ marginBottom: 8, marginLeft: 8, marginRight: 8, flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }} >
          <Button
            onPress={() => { this.props.navigation.navigate('ConsumerSvcRequestBids', {srid: rowData.service_id })}}
            title="See bids"
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

  rowPressed (svc) {
    const { navigate } = this.props.navigation;
    navigate('ff');
  }

  render() {
    const { navigate } = this.props.navigation;
    if (this.state.dataSource.getRowCount() > 0) {
      return (
        <View>
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
          <Text style={{ textAlign: 'center', marginTop: 30, fontSize: 20 }}>No service history </Text>
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

AppRegistry.registerComponent('ConsumerSvcHistory', () => ConsumerSvcHistory);
