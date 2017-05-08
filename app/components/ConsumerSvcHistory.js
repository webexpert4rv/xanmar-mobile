import React, { Component } from 'react';
import { AppRegistry, Button, Image, View, StyleSheet, Text, TouchableHighlight } from 'react-native';
import { ListView } from 'realm/react-native';
import realm from './realm';
import df from 'dateformat';

const svcHistoryIcon = require('../img/svc_history_icon.png');

export default class ConsumerSvcHistory extends Component {
  static navigationOptions = {
    title: 'Service History',
    header: {
      visible: false,
    },
    tabBar: {
      icon: ({ tintColor }) => (
        <Image
          source={svcHistoryIcon}
          style={{ width: 26, height: 26, tintColor: tintColor }}
        />
     ),
    },
  };

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const v = realm.objects('ServiceRequest');
    this.state = {
      dataSource: ds.cloneWithRows(v),
    };
  }

  renderRow(rowData, sectionID, rowID, highlightRow){
    console.log(JSON.stringify(rowData));
    const sd = df(rowData.service_date, 'dddd mmmm dS, yyyy');
    return(
      <View style={styles.container}>
        <View style={styles.vehicle}>
          <Text style={styles.title}>
            {rowData.year} {rowData.make} {rowData.model}
          </Text>
          <Text style={styles.footnote}>
            {sd}
          </Text>
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
