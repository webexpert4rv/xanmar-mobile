import React, { Component } from 'react';
import {
  AppRegistry,
  Button,
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableOpacity,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';
import format from 'string-format';
import constants from '../constants/c';
import ServiceItem from './ServiceItem';

export default class servicePicker extends Component {

  constructor(props) {
    super(props);
    // this._onCheckBoxPressed = this._onCheckBoxPressed.bind(this);
    this._onCompletedChange = this._onCompletedChange.bind(this);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      showServices: false,
      servicesPicked: [],
      dataSource: ds.cloneWithRows(this.props.currentServices),
      currentServices: this.props.currentServices,
    };
    // console.log(JSON.stringify(this.props.currentServices));
  }

  componentDidMount() {
    //this.fetchData();
  }

  fetchData() {
    // const data = '[{ "category": "cat1","services":["service1","service2", "service3"] },{ "category": "cat2", "services":["service1","service2", "service3"] } ]';
    // this.setState({
    //   dataSource: this.state.dataSource.cloneWithRows(JSON.parse(data)),
    //   isLoading: false,
    // });

    fetch(format('{}/api/autoservices', constants.BASSE_URL))
      .then(response => response.json())
      .then((responseData) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseData.categories),
          isLoading: false,
        });
      })
      .done();
  }
    // *************
    //******************
    // TO DO: MODAL !!!! build out pick service page and create svc picker!!!
    // *************
    //******************

  doSomething(rd) {
    this.setState({
      ss: rd.services,
      showServices: true,
      category: rd.category,
      servicesPicked: [],
      serviceContainer: rd,
    });
  }
  renderRow(rowData, sectionID, rowID, highlightRow){
    // console.log('rowData');
    // console.log(JSON.stringify(rowData));
    var expand = false;
    return(
      <TouchableHighlight onPress={() => {
          this.doSomething(rowData);
        }}>
        <View style={styles.row}>
          <Text style={styles.name}>
            {rowData.name}
          </Text>
        </View>
      </TouchableHighlight>
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

//   _onPressButton(s) {
//     console.log('button pressed for '.concat(s.service_id));
//   }
//
//   _onCheckBoxPressed() {
//   var data = this.state.data;
//   data.checked = !data.checked;
//   this.setState({
//     data: data
//   });
//
//   this.props.onCompletedChange(data, this.props.dataIndex);
// }

  _onCompletedChange(item) {
    // console.log('item:');
    // console.log(JSON.stringify(item));
    // if (item.checked) {
    //   this.state.servicesPicked.push(item)
    // } else {
    //   const index = this.state.servicesPicked.indexOf(item);
    //   if (index > -1) {
    //     this.state.servicesPicked.splice(index, 1);
    //   }
    // }

    // console.log('all items:');
    // console.log(JSON.stringify(this.state.currentServices));

    // const ii = this.state.currentServices.indexOf(item);
    // console.log(ii);
    // if (ii !== -1) {
    //   console.log('wtf');
    //   this.state.currentServices.services[ii] = item;
    // }
//     console.log('_onCompletChange');
// console.log(JSON.stringify(this.state.currentServices));
    // console.log('_onCompletedChange');
    // console.log(JSON.stringify(this.state.servicesPicked));
  }

  save() {
    this.setState({ showServices: false });
    const services = {
      category: this.state.category,
      services: this.state.servicesPicked,
    }
    let modifiedList = this.state.currentServices.slice();
    this.props.onServicePickCompleted(modifiedList);
    //callback to services
    //sending array of category objects with services picked.
  }
  render() {
    if (this.state.showServices) {
      let data = {checked: true};
      let color = '#6495ed';

      return (
          <View>

          {this.state.ss.map((item, index) => {
            // {this.state.ss.map((item, index) => {
              // item.checked = false
              return (
                <ServiceItem key={index} data={item} onCompletedChange={this._onCompletedChange} />
                // <View style={{flexDirection: 'row', alignItems: 'center', padding: 1}}>
                //   <CheckBox data={item} color={color} onCheckBoxPressed={this._onCheckBoxPressed}></CheckBox>
                //   <Text key={index}> {item.name} </Text>
                // </View>
              );
            })}
            <Button
              style={{ width: 800 }}
              onPress={() => this.save()}
              title="Save"
            />
          </View>
      );
    } else {
      return (
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          renderSeparator={this.renderSeparator}
          style={ styles.list }
        />
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  name: {
    fontSize: 20,
    textAlign: 'left',
    margin: 10,
    color: '#FFFFFF',
  },
  desc: {
    textAlign: 'left',
    color: '#333333',
    marginBottom: 5,
    margin: 10
  },
  separator: {
       height: 1,
       backgroundColor: '#dddddd'
   },
   loading: {
       flex: 1,
       alignItems: 'center',
       justifyContent: 'center'
   },
   row: {
    paddingVertical: 20,
    backgroundColor: '#6495ed',
  },
});

AppRegistry.registerComponent('servicePicker', () => servicePicker);
