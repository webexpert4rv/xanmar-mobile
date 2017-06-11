import React, { Component } from 'react';
import { DeviceEventEmitter, AppRegistry, Button, View, StyleSheet, Text, TextInput, TouchableHighlight } from 'react-native';
import { ListView } from 'realm/react-native';
import format from 'string-format';
import realm from './realm';
import constants from '../constants/c';
import PushController from './PushController';
import palette from '../style/palette';
import { bidStyles } from '../style/style';

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
      srid: state.params.srid,
    };
  }
  componentWillMount() {
    DeviceEventEmitter.addListener('onBidAccepted', this.fetchData.bind(this))
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
     var status;
     var s;
     var buttonText;
     console.log(JSON.stringify(rowData.customer_info));
     if (rowData.accepted) {
       status = 'Accepted';
       s = bidStyles.statusAccepted;
       buttonText = "View merchant information";
     } else {
       status = 'Open';
       s = bidStyles.statusOpen;
       buttonText = "View bid details";
     }

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
           <Text style={s}>
             {status}
           </Text>
         </View>
         <View style={{ marginBottom: 8, marginLeft: 8, marginRight: 8, flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }} >
           <Button
             onPress={() => { this.props.navigation.navigate('ConsumerSvcRequestBidDetails', { bid: rowData, srid: this.state.srid })}}
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


// TRY AGAIN
  render() {
    console.log('row count');
    console.log(this.state.dataSource.getRowCount());
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
          <Text style={{ textAlign: 'center', marginTop: 60, fontSize: 20 }}>No one has bidded on your service request. </Text>
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
