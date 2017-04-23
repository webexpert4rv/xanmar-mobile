import Realm from 'realm';

class UserPreference extends Realm.Object {}
UserPreference.schema = {
  name: 'UserPreference',
  properties: {
    onboarded: { type: 'bool', default: false },
    userId: 'int',
    role: 'string',
  },
};

class Vehicle extends Realm.Object {}
Vehicle.schema = {
  name: 'Vehicle',
  properties: {
    make: 'string',
    model: 'string',
    year: 'string',
  },
};

class Service extends Realm.Object {}
Service.schema = {
  name: 'Service',
  properties: {
    service_id: 'int',
    name: 'string',
    checked: { type: 'bool', default: false },
  },
};

class ServiceCategory extends Realm.Object {}
ServiceCategory.schema = {
  name: 'ServiceCategory',
  properties: {
    name: 'string',
    services: { type: 'list', objectType: 'Service' },
  },
};

export default new Realm({ schema: [UserPreference, Vehicle, Service, ServiceCategory] });
