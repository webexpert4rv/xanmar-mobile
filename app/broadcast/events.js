import Rx from 'rxjs/Rx';

export const svcRequestBroadcast = new Rx.Subject();
export const merchantJobsBroadcast = new Rx.Subject();
export const svcRequestBidsBroadcast = new Rx.Subject();
export const merchantJobAcceptedBroadcast = new Rx.Subject();
export const merchantJobChangeBroadcast = new Rx.Subject();
export const svcRequestMessageBroadcast = new Rx.Subject();
export const merchantAccountChangeBroadcast = new Rx.Subject();


export const getSvcRequestMessageEvents = () => {
  return svcRequestMessageBroadcast;
};

export const sendSvcRequestMessageEvent = (change) => {
  svcRequestMessageBroadcast.next(change);
};

export const getMerchantJobChangeEvents = () => {
  return merchantJobChangeBroadcast;
};

export const sendMerchantJobChangeEvent = (change) => {
  merchantJobChangeBroadcast.next(change);
};

export const getSvcRequestEvents = () => {
  return svcRequestBroadcast;
};

export const sendSvcRequestEvent = (svcReq) => {
  svcRequestBroadcast.next(svcReq);
};

export const getMerchantJobsEvents = () => {
  return merchantJobsBroadcast;
};

export const sendMerchantJobEvent = (job) => {
  merchantJobsBroadcast.next(job);
}

export const getSvcRequestBidsEvents = () => {
  return svcRequestBidsBroadcast;
};

export const sendSvcRequestBidEvent = (bid) => {
  svcRequestBidsBroadcast.next(bid);
}


export const getMerchantJobAcceptedEvents = () => {
  return merchantJobAcceptedBroadcast;
};

export const sendMerchantJobAcceptedEvent = (bid) => {
  merchantJobAcceptedBroadcast.next(bid);
}

export const getMerchantAccountChangeEvents = () => {
  return merchantAccountChangeBroadcast;
};

export const sendMerchantAccountChangeEvent = (change) => {
  merchantAccountChangeBroadcast.next(change);
};
