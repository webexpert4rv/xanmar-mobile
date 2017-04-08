import React, { Component } from 'react';
import { Alert,
        AppRegistry,
        Button,
        View,
        Picker,
        Text, TextInput } from 'react-native';

export default class registerVehicle extends Component {
  static navigationOptions = {
    title: 'Register Vehicle',
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      vehicles: [],
      models: [],
    };
  }

  componentDidMount() {
    this.fetchVehicles();
  }

  fetchVehicles() {
    fetch('http://192.168.86.214:3000/api/vehicles')
      .then(response => response.json())
      .then((responseData) => {
        this.setState({
          isLoading: !this.state.isLoading,
          vehicles: responseData.vehicles,
        });
      })
      .done();
  }

  registerVehicle() {
    const { navigate } = this.props.navigation;
    fetch('http://192.168.86.214:3000/api/user/vehicle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: this.state.userId,
        make: this.state.make.make,
        model: this.state.model,
        year: this.state.vehicleYear,
      }),
    })
      .then(response => response.json())
      .then((responseData) => {
        navigate('Main')
      })
      .done();
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <View>
          <Text style={{ marginLeft: 20, textAlign: 'left', marginTop: 30, fontSize: 20 }}>Vehicle Information </Text>
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 20, marginLeft: 20 }}>
          <TextInput
            style={{ height: 60, width: 100 }}
            placeholder="year"
            onChangeText={text => this.setState({ vehicleYear: text })}
          />
        </View>
        <View style={{ width: 300, marginLeft: 20, marginTop: 50 }}>
          <Text style={{ marginLeft: 5, textAlign: 'left', fontSize: 15 }}>Make</Text>
          <Picker
            selectedValue={(this.state && this.state.make)}
            onValueChange={(value) => {
              this.setState({
                models: value.models,
                make: value,
              });
            }}
          >
            {this.state.vehicles.map((item, index) => {
              return <Picker.Item key={index} label={item.make} value={item} />;
            })}
          </Picker>
        </View>
        <View style={{ width: 300, marginLeft: 20, marginTop: 50 }}>
          <Text style={{ marginLeft: 5, textAlign: 'left', fontSize: 15 }}>Model</Text>
          <Picker
            selectedValue={(this.state && this.state.model)}
            onValueChange={(value) => { this.setState({ model: value }); }}
          >
            {this.state.models.map((item, index) => {
              return <Picker.Item key={index} label={item} value={item} />;
            })}
          </Picker>
        </View>
        <View style={{ marginTop: 20, marginBottom: 10, height: 50, flexDirection: 'column', alignItems: 'center' }}>
          <Button
            style={{ width: 800 }}
            onPress={() => this.registerVehicle()}
            title="Register Vehicle"
          />
        </View>
      </View>
    );
  }
}

AppRegistry.registerComponent('registerVehicle', () => registerVehicle);
