import React, { Component } from 'react';
import { AppRegistry,
        Button,
        Modal,
        View,
        Picker,
        StyleSheet,
        Text, TextInput,
        TouchableHighlight,
        TouchableWithoutFeedback } from 'react-native';
import { NavigationActions } from 'react-navigation';
import DropDown, {
  Select,
  Option,
  OptionList,
} from 'react-native-selectme';
import format from 'string-format';
import constants from '../constants/c';
import realm from './realm';
import MakePicker from './MakePicker';
import ModelPicker from './ModelPicker';

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#6495ed',
    padding: 10,
    marginTop: 10,
    height: 45,
  },
  year: {
    borderWidth: 1,
    borderColor: '#6495ed',
    marginTop: 10,
  },
  hint: {
    color: '#000000',
  },
});

export default class registerVehicle extends Component {
  static navigationOptions = {
    title: 'Register Vehicle',
    header: {
      titleStyle: {
        color: '#FFFFFF',
      },
      style: {
        backgroundColor: '#6495ed',
      },
      tintColor: '#FFFFFF',
    },
  };

  constructor(props) {
    super(props);
    this.onMakePickCompleted = this.onMakePickCompleted.bind(this);
    this.onModelPickCompleted = this.onModelPickCompleted.bind(this);
    this.state = {
      showMakePicker: false,
      showModelPicker: false,
      make: 'Make',
      model: 'Model',
      vehicles: [],
      models: [],
    };
  }

  componentDidMount() {
    this.fetchVehicles();
  }

  fetchVehicles() {
    fetch(format('{}/api/vehicles', constants.BASSE_URL))
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
    console.log(this.state.vehicleYear);
    const { navigate } = this.props.navigation;
    realm.write(() => {
      realm.create('Vehicle', { make: this.state.make, model: this.state.model, year: this.state.vehicleYear });
    });
    fetch(format('{}/api/user/vehicle', constants.BASSE_URL), {
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
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: 'consumerTab' }),
          ],
        });
        this.props.navigation.dispatch(resetAction);
      })
      .done();
  }

  showMakeList() {
    this.setState({ showMakePicker: true });
  }

  onMakePickCompleted(v) {
    this.setState({ make: v.make, models: v.models, showMakePicker: false });
  }

  onModelPickCompleted(m) {
    this.setState({ model: m, showModelPicker: false });
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <View>
          <Text style={{ marginLeft: 20, textAlign: 'left', marginTop: 30, fontSize: 20 }}>Vehicle Information </Text>
        </View>
        <View style={{ width: 300, marginLeft: 20, marginTop: 25 }}>
        <TextInput
          keyboardType="numeric"
          returnKeyType="done"
          style={{height: 45, borderColor: '#6495ed', borderWidth: 1, padding: 10}}
          maxLength={4}
          placeholder="Year"
          placeholderTextColor="#000000"
          underlineColorAndroid="transparent"
          onChangeText={text => this.setState({ vehicleYear: text })}
        />

          <TouchableWithoutFeedback onPress={() => this.setState({ showMakePicker: true })}>
            <View style={styles.container}>
              <Text style={styles.hint}>{this.state.make}</Text>
            </View>
          </TouchableWithoutFeedback>
          <Modal
            animationType={'slide'}
            transparent={true}
            visible={this.state.showMakePicker}
            onRequestClose={() => {alert('Modal has been closed.') }}
          >
            <View style={{ width: 325, height: 500, margin: 50, backgroundColor: '#ffffff', padding: 20 }}>
              <MakePicker make={this.state.vehicles} onMakePickCompleted={this.onMakePickCompleted} />
            </View>
          </Modal>

          <TouchableWithoutFeedback onPress={() => this.setState({ showModelPicker: true })}>
            <View style={styles.container}>
              <Text style={styles.hint}>{this.state.model}</Text>
            </View>
          </TouchableWithoutFeedback>
          <Modal
            animationType={'slide'}
            transparent={true}
            visible={this.state.showModelPicker}
            onRequestClose={() => {alert('Modal has been closed.') }}
          >
            <View style={{ margin: 50, backgroundColor: '#ffffff', padding: 20 }}>
              <ModelPicker models={this.state.models} onModelPickCompleted={this.onModelPickCompleted} />
            </View>
          </Modal>
        </View>

        <View style={{ marginTop: 40, marginBottom: 10, height: 50, flexDirection: 'column', alignItems: 'center' }}>
          <Button
            style={{ width: 800 }}
            color="#2668ba"
            onPress={() => this.registerVehicle()}
            title="Register Vehicle"
          />
        </View>

      </View>
    );
  }
}

AppRegistry.registerComponent('registerVehicle', () => registerVehicle);
