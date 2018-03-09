import React, { Component, PropTypes } from 'react';
import { AppRegistry, Image, View, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ListView } from 'realm/react-native';
import format from 'string-format';
import { common, inbox } from '../style/style';
import realm from './realm';
import constants from '../constants/c';
import PushController from './PushController';
import palette from '../style/palette';
import * as jobEvents from '../broadcast/events';

const bidsIcon = require('../img/tabbar/bids_on.png');

export default class MerchantBids extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Bids',
      header: null,
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={bidsIcon}
          style={{ width: 26, height: 26, tintColor }}
        />
      ),
    };
  };

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      dataSource: ds.cloneWithRows([]),
    };
  }

  componentDidMount() {
    this.fetchData();
    jobEvents.getMerchantJobChangeEvents().subscribe((value) => {
      this.fetchData();
    });
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
    fetch(format('{}/api/provider/bids/{}', constants.BASSE_URL, this.getUserId()), {
      headers: {
        Authorization: constants.API_KEY,
      },
    })
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

  gotoBidDetails(bid) {
    console.log(bid.accepted);
    if (!bid.accepted) {
      this.props.navigation.navigate('JobDetails', { job: bid });
    } else {
      this.props.navigation.navigate('ActiveBid', { job: bid });
    }
  }

  renderRow(rowData, sectionID, rowID, highlightRow){
    let status;
    let s;
    let buttonText;
    const comment = 'Need to capture comment goes here';
    if (rowData.accepted) {
      status = 'ACCEPTED';
      s = styles.statusAccepted;
      buttonText = 'View customer information';
    } else {
      status = 'OPEN';
      s = styles.statusOpen;
      if (rowData.did_bid) {
        buttonText = 'Bid submitted';
        status = 'SUBMITTED BID';
      } else {
        buttonText = 'Bid on service request';
      }
    }

    if (rowData.did_bid) {
      return(
        <TouchableOpacity activeOpacity={1} onPress={() => { this.gotoBidDetails(rowData); }} >
          <View style={inbox.container}>
            <View style={{ marginLeft: 10, flexDirection: 'row', marginBottom: 2 }} >
              <View
                style={
                  { marginTop: 10,
                    marginRight: 10,
                    width: 5,
                    height: 5,
                    borderRadius: 5,
                    borderWidth: 5,
                    borderColor: palette.LIST_BLUE_DOT }}
              />
              <Text style={inbox.title}>
                Diagonostic Services
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }} >
              <View style={{ flex: 0.9 }}>
                <View style={{ marginLeft: 35, marginBottom: 2 }} >
                  <Text style={inbox.subTitle}>
                    {rowData.year} {rowData.make} {rowData.model}
                  </Text>
                </View>
                <View style={{ marginLeft: 35, marginRight: 30, marginBottom: 7 }} >
                  <Text style={inbox.subTitle} numberOfLines={2}>
                    {comment}
                  </Text>
                </View>
                <View style={[inbox.submittedBid]} >
                  <Text style={inbox.status} numberOfLines={2}>
                    {status}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 0.1 }}>
                <Text style={inbox.arrow}>
                  &rsaquo;
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={styles.closedContainer}>
          <View style={styles.vehicle}>
            <Text style={styles.title}>
              {rowData.year} {rowData.make} {rowData.model}
            </Text>
            <Text style={styles.footnote}>
              Requested service date: {rowData.service_date}
            </Text>
            <Text style={styles.statusClosed}>
              closed
            </Text>
          </View>
        </View>
      );
    }

  }

  renderSeparator(sectionID, rowID, adjacentRowHighlighted){
    return(
      <View
        key={`${sectionID}-${rowID}`}
        style={{
          height: adjacentRowHighlighted ? 4 : 1,
          backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#CCCCCC',
          marginTop: 2.5,
        }}
      />
    );
  }

  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;

    if (this.state.dataSource.getRowCount() > 0) {
      return (

        <View style={common.consumerContainer}>
          <View
            style={{ backgroundColor: palette.HEADER_BLUE,
              alignSelf: 'stretch',
              height: HEIGHT,
              flexDirection: 'row',
              justifyContent: 'space-between' }}
          >
            <View style={{ width: 50 }} />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={common.headerTitle}>
                Bids
              </Text>
            </View>
            <View style={{ width: 50 }} />
          </View>
          <ListView
            style={{ marginTop: 10 }}
            dataSource={this.state.dataSource}
            renderRow={this.renderRow.bind(this)}
          />
        </View>
      );
    } else {
      return (
        <View style={common.consumerContainer}>
          <View
            style={{ backgroundColor: palette.HEADER_BLUE,
              alignSelf: 'stretch',
              height: HEIGHT,
              flexDirection: 'row',
              justifyContent: 'space-between' }}
          >
            <View style={{ width: 50 }} />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={common.headerTitle}>
                Bids
              </Text>
            </View>
            <View style={{ width: 50 }} />
          </View>

          <View>
            <Text style={{ textAlign: 'center', marginTop: 30, fontSize: 20 }}> There are no bids on any service requests. Service request show up in the request tab for bidding.</Text>
          </View>
        </View>

      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 120,
    backgroundColor: palette.WHITE,
    marginLeft: 8,
    marginRight: 8,
  },
  closedContainer: {
    flex: 1,
    height: 120,
    backgroundColor: '#D3D3D3',
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
  statusClosed: {
    fontSize: 13,
    color: '#A80000',
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

MerchantBids.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('MerchantBids', () => MerchantBids);
