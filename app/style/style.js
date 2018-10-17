import { Platform, StyleSheet } from 'react-native';

import palette from './palette';

export const subscriptions = StyleSheet.create({

  unselected: {
    width: 100,
    height: 100,
    backgroundColor: 'steelblue',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selected: {
    width: 100,
    height: 100,
    backgroundColor: palette.DARK_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bullet: {
    marginTop: 3,
    width: 10,
    height: 10,
    borderRadius: 100/2,
    backgroundColor: palette.LIGHT_BLUE,
  }

});

export const inbox = StyleSheet.create({
  container: {
    height: 125,
    backgroundColor: palette.WHITE,
  },
  canceled: {
    height: 125,
    backgroundColor: palette.LIGHT_GRAY,
  },
  title: {
    fontSize: 20,
    color: palette.BLACK,
    fontWeight: 'bold',
  },
  viewed: {
    fontSize: 20,
    color: palette.BLACK,
  },
  notViewed: {
    fontSize: 20,
    color: palette.BLACK,
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 15,
    color: palette.INBOX_TEXT_COLOR,
  },
  submittedBid: {
    width: 115,
    marginLeft: 35,
    padding: 2,
    backgroundColor: palette.WHITE,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: palette.SUBMITTED_BID,
  },
  status: {
    fontSize: 13,
    color: palette.SUBMITTED_BID,
    textAlign: 'center',
  },
  arrow: {
    fontSize: 40,
    color: palette.SUBMITTED_BID,
    textAlign: 'center',
  },
});

export const quote = StyleSheet.create({
  container: {
    height: 125,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: palette.HEADER_BLUE,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
  },
  merchantMessage: {
    height: 125,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: palette.QUOTE_REPLY_COLOR,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  textInput: {
    color: palette.WHITE,
    marginTop: 15,
    width: 125,
    fontSize: 50,
  },
  replyContainer: {
    fontSize: 20,
    color: palette.BLACK,
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 15,
    color: palette.INBOX_TEXT_COLOR,
  },
  submittedBid: {
    width: 115,
    marginLeft: 35,
    padding: 2,
    backgroundColor: palette.WHITE,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: palette.SUBMITTED_BID,
  },
  status: {
    fontSize: 13,
    color: palette.SUBMITTED_BID,
    textAlign: 'center',
  },
  arrow: {
    fontSize: 40,
    color: palette.SUBMITTED_BID,
    textAlign: 'center',
  },
});

export const reviewPopup = StyleSheet.create({

  container: {
    height: 300,
    flexDirection: 'column',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

});

export const dashboard = StyleSheet.create({

  container: {
    flex: 1,
    height: 120,
    backgroundColor: palette.DASHBOARD_GRAY,
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  statusInProgress: {
    fontSize: 13,
    color: palette.STATUS_GREEN,
  },
  statusRequested: {
    fontSize: 13,
    color: palette.STATUS_ORANGE,
  },
  statusCompleted: {
    fontSize: 13,
    color: palette.STATUS_BLUE,
  },
  statusCanceled: {
    fontSize: 13,
    color: palette.STATUS_RED,
  },
  line: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: palette.LIGHT_GRAY,
    marginLeft: 0,
    marginRight: 0,
  },
});

export const serviceRequest = StyleSheet.create({

  container: {
    flex: 1,
    height: 120,
    backgroundColor: palette.WHITE,
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  statusWaitingOnBids: {
    fontSize: 15,
    color: palette.STATUS_RED,
  },
  statusWaitingOnBidsUnread: {
    fontSize: 15,
    color: palette.STATUS_RED,
    fontWeight: 'bold',
  },

  statusInProgress: {
    fontSize: 13,
    color: palette.STATUS_GREEN,
  },
  statusInProgressUnread: {
    fontSize: 13,
    color: palette.STATUS_GREEN,
    fontWeight: 'bold',
  },

  statusBidsAvailable: {
    fontSize: 13,
    color: palette.STATUS_ORANGE,
  },
  statusBidsAvailableUnread: {
    fontSize: 13,
    color: palette.STATUS_ORANGE,
    fontWeight: 'bold',
  },

  statusCompleted: {
    fontSize: 13,
    color: palette.STATUS_BLUE
  },
  title: {
    textAlign: 'center',
    fontSize: 27,
    color: palette.WHITE,
  },
  subTitle: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 19,
    color: palette.LIGHT_BLUE,
  },
  textInput: {
    marginTop: 10,
    height: 50,
    color: palette.WHITE,
    fontSize: 20,
    textAlign: 'center',
    paddingRight: 20,
  },
  line: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: palette.LIGHT_BLUE,
    marginLeft: 20,
    marginRight: 20,
  },
});

export const common = StyleSheet.create({
  header: {
    backgroundColor: palette.DARK_BLUE,
    elevation: 0, //remove shadow on Android
    shadowOpacity: 0, //remove shadow on iOS
  },
  headerButton: {
    fontSize: 20,
    color: palette.WHITE,
    paddingRight: 20,
  },
  blueAddHeaderButton: {
    fontSize: 35,
    color: palette.LIGHT_BLUE,
    paddingRight: 20,
  },
  imageCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  center: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dashboardContainer: {
    backgroundColor: palette.DASHBOARD_GRAY,
    flex: 1,
  },
  consumerContainer: {
    backgroundColor: palette.WHITE,
    flex: 1,
  },
  consumerSvcRequestContainer: {
    backgroundColor: palette.DARK_BLUE,
    flex: 1,
  },

  merchantContainer: {
    backgroundColor: palette.DARK_BLUE,
    flex: 1,
  },

  thinGrayLine: {
    width: 600,
    borderWidth: 0.2,
    borderColor: palette.GRAY,
  },
  headerTitle: {
    fontSize: 20,
    color: palette.WHITE,
  },
  headerLeftButton: {
    fontSize: 20,
    color: palette.WHITE,
    paddingRight: 20,
  },
  annotationContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
  },
  annotationFill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'orange',
    transform: [{ scale: 0.6 }],
  },
  stickyBottomBlueButton: {
    width: '100%',
    height: 50,
    backgroundColor: palette.LIGHT_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0
  },
});

export const onboardingStyles = StyleSheet.create({
  mainContainer: {
    backgroundColor: palette.DARK_BLUE,
    flex: 1,
  },
  small: {
    fontSize: 13,
    color: palette.WHITE,
  },
  medium: {
    fontSize: 20,
    color: palette.WHITE,
  },
  large: {
    fontSize: 25,
    color: palette.WHITE,
  },
  title: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 25,
    color: palette.WHITE,
  },
  subTitle: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 18,
    color: palette.WHITE,
  },
  imageCenter: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  textInput: {
    color: palette.WHITE,
    fontSize: 20,
    textAlign: 'left',
  },
  label: {
    color: palette.LIGHT_BLUE,
    fontSize: 20,
  },
  line: {
    width: 600,
    borderWidth: 1,
    borderColor: palette.LIGHT_BLUE,
  },
  headerButton: {
    fontSize: 20,
    color: palette.WHITE,
    paddingRight: 20,
  },

});

export const bidStyles = StyleSheet.create({
  statusAccepted: {
    fontSize: 13,
    color: '#2ECC71',
  },
  statusOpen: {
    fontSize: 13,
    color: '#FF8C00',
  },
  customerInfo: {
    paddingLeft: 10,
  },
  customerDetail: {
    fontSize: 15,
    fontWeight: 'bold',
    padding: 10,
  },
});

export const formStyles = StyleSheet.create({
  error: {
    fontSize: 13,
    color: '#FF0000',
  },
});

export const listStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 0,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: palette.lightgray,
  },
  listView: {
    flex: 1,
  },
  scrollSpinner: {
    marginVertical: 20,
  },
  rowSeparator: {
    backgroundColor: palette.BORDER_COLOR,
    height: 1,
    marginLeft: 0,
  },
  rowSeparatorHide: {
    opacity: 0.0,
  },
});


export const navStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 0,
    backgroundColor: palette.lightgray,
  },
});

export const buttonStyles = StyleSheet.create({
  buttonText: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
  },
  button: {
    height: 46,
    backgroundColor: palette.lightblue,
    borderColor: palette.lightblue,
    borderWidth: 1,
    borderRadius: 2,
    padding: 5,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  link: {
    color: 'blue',
  },
});

export const propertyListStyles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: -1,
    backgroundColor: '#fff',
    flexDirection: 'column',
  },
  section: {
    backgroundColor: '#fff',
    flexDirection: 'column',
  },
  sectionHead: {
    padding: 10,
    backgroundColor: palette.lightgray,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderColor: palette.BORDER_COLOR,
    borderBottomWidth: 0,
    borderTopWidth: 0,
  },
  values: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  valueText: {
    fontSize: 12,
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  sectionHeadText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  base64: {
    height: 100,
    width: 100,
    backgroundColor: 'red',
  },
});

export const routerStyles = StyleSheet.create({
  navBar: {
    backgroundColor: palette.lightblue,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
  },
  leftButtonStyle: {

  },
  buttonTextStyle: {
    color: 'white',
    fontWeight: 'bold',
    paddingRight: 10,
  },
  layersIcon: {
    right: 10,
    position: 'absolute',
  },
  layersIconImg: {
    tintColor: 'white',
  },
  leftButtonIconStyle: {
    tintColor: 'white',
  },
});
