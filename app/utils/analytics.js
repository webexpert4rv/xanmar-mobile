import {Platform} from 'react-native';
import constants from '../constants/c';
import eventConstants from '../constants/e';
import Analytics, { AnalyticsConstants } from 'react-native-analytics-segment-io'
const enabled = constants.ANALYTICS === 'ON';
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
			console.log('analytics init sucess', isSuccess);
		}).catch(err => {
			mixpanelReady = false
			console.log('analytics init', err);
		})
		
	}else{
		console.log("analytics is disabled, enable it from constants: ANALYTICS: 'ON'");
	}
};

export const trackableEvents = eventConstants;

export const trackWithProperties = (evt, properties) => {
	if (enabled) {
		Analytics.track(evt,properties)
	}
}