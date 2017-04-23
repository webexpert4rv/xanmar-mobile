import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

export default class RegisterServices extends Component {
  static navigationOptions = {
    title: 'Register - Services offered',
  };

  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      isLoading: true,
      dataSource: ds,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    // const data = '[{ "category": "cat1","services":["service1","service2", "service3"] },{ "category": "cat2", "services":["service1","service2", "service3"] } ]';
    // this.setState({
    //   dataSource: this.state.dataSource.cloneWithRows(JSON.parse(data)),
    //   isLoading: false,
    // });

    fetch('http://192.168.86.214:3000/api/autoservices')
      .then(response => response.json())
      .then((responseData) => {
        console.log(JSON.stringify(responseData));
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseData.categories),
          isLoading: false,
        });
      })
      .done();
  }
    // *************
    //******************
    // TO DO: MODAL !!!! build out pick service page and create svc picker
    // *************
    //******************

  renderRow(rowData, sectionID, rowID, highlightRow){
    console.log(JSON.stringify(rowData));
    return(
      <View style={styles.row}>
        <Text style={styles.name}>
          {rowData.category}
        </Text>
      </View>
    );
  }

  renderSeparator(sectionID, rowID, adjacentRowHighlighted){
    console.log('renderSeparator',sectionID, rowID, adjacentRowHighlighted);
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

  renderLoadingView() {
    return (
        <View style={styles.loading}>
          <ActivityIndicator
            animating={this.state.animating}
            style={[styles.centering, {height: 80}]}
            size="large"
          />
          <Text>
                Loading services ...
          </Text>
        </View>
    );
  }

  render() {

    // if (this.state.isLoading) {
    //        return this.renderLoadingView();
    // }

    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        renderSeparator={this.renderSeparator}
        style={ styles.list }
      />
    );
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
    backgroundColor: '#C70039',
  },
});

AppRegistry.registerComponent('RegisterServices', () => RegisterServices);
