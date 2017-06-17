import React, { Component } from 'react';
import { AppRegistry, Button, View, StyleSheet, Text, TouchableHighlight } from 'react-native';
import { ListView } from 'realm/react-native';
import format from 'string-format';
import realm from './realm';
import constants from '../constants/c';
import PushController from './PushController';

export default class MerchantJobs extends Component {
  static navigationOptions = {
    title: 'Jobs',
    header: null,
  };

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const v = realm.objects('Vehicle');
    this.state = {
      dataSource: ds.cloneWithRows(v),
    };
  }

  componentDidMount() {
    this.fetchData();
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
    fetch(format('{}/api/provider/jobs/{}', constants.BASSE_URL, this.getUserId()))
      .then(response => response.json())
      .then((responseData) => {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.setState({
          dataSource: ds.cloneWithRows(responseData.jobs),
          isLoading: false,
        });
      })
      .done();
  }

  renderRow(rowData, sectionID, rowID, highlightRow){
    var status;
    var s;
    var buttonText;
    console.log(JSON.stringify(rowData.customer_info));
    if (rowData.accepted) {
      status = 'Accepted';
      s = styles.statusAccepted;
      buttonText = "View customer information";
    } else {
      status = 'Open';
      s = styles.statusOpen;
      buttonText = "Bid on service request";
    }
    return(
      <View style={styles.container}>
        <View style={styles.vehicle}>
          <Text style={styles.title}>
            {rowData.year} {rowData.make} {rowData.model}
          </Text>
          <Text style={styles.footnote}>
            Requested service date: {rowData.service_date}
          </Text>
          <Text style={s}>
            {status}
          </Text>
        </View>
        <View style={{ marginBottom: 8, marginLeft: 8, marginRight: 8, flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }} >
          <Button
            onPress={() => { this.props.navigation.navigate('JobDetails', {job: rowData })}}
            title={buttonText}
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
    console.log('row pressed');
    const { navigate } = this.props.navigation;
    console.log('row pressed');
    navigate('ff');
    console.log('row pressed');
  }

  render() {
    const { navigate } = this.props.navigation;
    if (this.state.dataSource.getRowCount() > 0) {
      return (
        <View>
          <PushController />
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
          <PushController />
          <Text style={{ textAlign: 'center', marginTop: 30, fontSize: 20 }}>No current jobs available for your service area </Text>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 120,
    backgroundColor: '#F5FCFF',
    marginLeft: 8,
    marginRight: 8,
  },
  vehicle: {
    padding: 10,
  },
  statusAccepted: {
    fontSize: 13,
    color: '#2ECC71',
  },
  statusOpen: {
    fontSize: 13,
    color: '#FF8C00',
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

AppRegistry.registerComponent('MerchantJobs', () => MerchantJobs);
