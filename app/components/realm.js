import Realm from 'realm';

class UserPreference extends Realm.Object {}
UserPreference.schema = {
  name: 'UserPreference',
  properties: {
    onboarded: { type: 'bool', default: false },
    userId: { type: 'int', default: 0 },
    role: { type: 'string', default: '' },
    deviceToken: { type: 'string', default: '' },
    customerId: { type: 'string', default: '' },
    subscriptionId: { type: 'string', default: '' },
    plan: { type: 'string', default: '' },
    status: { type: 'string', default: '' },
  },
};

class ConsumerProfile extends Realm.Object {}
ConsumerProfile.schema = {
  name: 'ConsumerProfile',
  properties: {
    name: { type: 'string', default: '' },
    email: { type: 'string', default: '' },
    pwd: { type: 'string', default: '' },
    phone: { type: 'string', default: '' },
  },
};

class ServiceProviderProfile extends Realm.Object {}
ServiceProviderProfile.schema = {
  name: 'ServiceProviderProfile',
  properties: {
    email: { type: 'string', default: '' },
    pwd: { type: 'string', default: '' },
    business_name: { type: 'string', default: '' },
    phone: { type: 'string', default: '' },
    contact_name: { type: 'string', default: '' },
    address: { type: 'string', default: '' },
    city: { type: 'string', default: '' },
    state: { type: 'string', default: '' },
    zip: { type: 'string', default: '' },
  },
};

class Vehicle extends Realm.Object {}
Vehicle.schema = {
  name: 'Vehicle',
  properties: {
    vehicleId: { type: 'int', default: 0 },
    make: 'string',
    model: 'string',
    year: 'string',
  },
};

class CurrentVehicle extends Realm.Object {}
CurrentVehicle.schema = {
  name: 'CurrentVehicle',
  properties: {
    vehicleId: { type: 'int', default: 0 },
    make: 'string',
    model: 'string',
    year: 'string',
  },
};

class Service extends Realm.Object {}
Service.schema = {
  name: 'Service',
  primaryKey: 'service_id',
  properties: {
    service_id: 'int',
    name: 'string',
    checked: { type: 'bool', default: false },
  },
};

class ServiceCategory extends Realm.Object {}
ServiceCategory.schema = {
  name: 'ServiceCategory',
  primaryKey: 'category_id',
  properties: {
    category_id: 'int',
    name: 'string',
    checked: { type: 'bool', default: false },
    services: { type: 'list', objectType: 'Service' },
  },
};

class MerchantServices extends Realm.Object {}
MerchantServices.schema = {
  name: 'MerchantServices',
  primaryKey: 'category_id',
  properties: {
    category_id: 'int',
    name: 'string',
    checked: { type: 'bool', default: false },
    services: { type: 'list', objectType: 'Service' },
  },
};

class ServiceRequest extends Realm.Object {}
ServiceRequest.schema = {
  name: 'ServiceRequest',
  properties: {
    vehicle_id: 'int',
    service_id: 'int',
    user_id: 'int',
    service_date: 'date',
    service_zip: 'string',
    make: 'string',
    model: 'string',
    year: 'int',
    comment: 'string',
    status: 'string',
    services: { type: 'list', objectType: 'Service' },
  },
};

export default new Realm({ schema:
[UserPreference, Vehicle, CurrentVehicle, Service,
  ServiceCategory, ServiceRequest, MerchantServices,
  ConsumerProfile, ServiceProviderProfile] });
