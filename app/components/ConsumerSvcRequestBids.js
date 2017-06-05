import React, { Component } from 'react';
import { AppRegistry, Button, View, StyleSheet, Text, TextInput, TouchableHighlight } from 'react-native';
import { ListView } from 'realm/react-native';
import format from 'string-format';
import realm from './realm';
import constants from '../constants/c';
import PushController from './PushController';
import palette from '../style/palette';

export default class ConsumerSvcRequestBids extends Component {
  static navigationOptions = {
    title: 'Service Request Bids',
    header: {
      titleStyle: {
        color: palette.WHITE,
      },
      style: {
        backgroundColor: palette.PRIMARY_COLOR,
      },
      tintColor: palette.WHITE,
    },
  };

  constructor(props) {
    super(props);
    const { state } = this.props.navigation
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    this.state = {
      dataSource: ds,
      dict: {},
      srid: state.params.srid
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    fetch(format('{}/api/user/bids/{}', constants.BASSE_URL, this.state.srid))
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
     console.log('rowData');
     console.log(JSON.stringify(rowData));
     var total = rowData.bid_total;
     return(
       <View style={styles.container}>
         <View style={styles.vehicle}>
           <Text style={styles.title}>
             {rowData.business_name}
           </Text>
           <Text style={styles.title}>
             ${total.toFixed(2)}
           </Text>
         </View>
         <View style={{ marginBottom: 8, marginLeft: 8, marginRight: 8, flex: 1, flexDirection: 'row', justifyContent: 'space-around' }} >
           <Button
             onPress={() => { this.props.navigation.navigate('JobDetails', {spi: rowData.service_provider_id })}}
             title="Accept"
           />
           <Button
             onPress={() => { this.props.navigation.navigate('ConsumerSvcRequestBidDetails', {details: rowData.bid_detail })}}
             title="View details"
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


// TRY AGAIN
  render() {
    const { state } = this.props.navigation;
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

AppRegistry.registerComponent('ConsumerSvcRequestBids', () => ConsumerSvcRequestBids);
