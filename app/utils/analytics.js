import {Platform} from 'react-native';
import constants from '../constants/c';
import eventConstants from '../constants/e';
import Analytics, { AnalyticsConstants } from 'react-native-analytics-segment-io'
import realm from '../components/realm';
const enabled = constants.ANALYTICS === 'ON';
const logEnabled = constants.ANALYTICS_LOG === 'ON';

const key = Platform.OS === 'ios' ? constants.ANALYTICS_IOS_KEY : constants.ANALYTICS_ANDROID_KEY;
const options = { 
	[AnalyticsConstants.recordScreenViews]: true,
	[AnalyticsConstants.debug]: true,
	[AnalyticsConstants.trackApplicationLifecycleEvents]: true,
}
let mixpanelReady = false;
export const initialized = () => {
	return mixpanelReady;
};

export const init = () => {
	if (enabled) {
		Analytics.setup(key, options).then( isSuccess =>{
			mixpanelReady = true
			if(logEnabled){
				console.log('analytics init sucess', isSuccess);
			}
		}).catch(err => {
			mixpanelReady = false
			console.log('analytics init', err);

		})
		
	}else{
		if(logEnabled){
			console.log("analytics is disabled, enable it from constants: ANALYTICS: 'ON'");
		}
		
	}
};

export const trackableEvents = eventConstants;

export const trackWithProperties = (evt, properties) => {
	let p = { ...properties , ...{ uId: getUserId() }}
	if(logEnabled){
		console.log('ANALYTICS::',evt, p)
	}
	if (enabled) {
		Analytics.track(evt,p)
	}
}

const getUserId = ()=> {
    let uId = 0;
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      uId = userPrefs[0].userId;
    }
    return uId;
  }