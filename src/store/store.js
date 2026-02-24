import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import complaintReducer from "./slices/complaintSlice";
import trainingAppReducer from "./slices/trainingAppSlice";
import countryReducer from "./slices/countrySlice";
import categoryReducer from "./slices/categorySlice";
import appReducer from "./slices/appSlice";
import hostingApplicationReducer from "./slices/hostingApplicationSlice";
import eventApplicationReducer from "./slices/eventApplicationSlice";
import agencyApplicationReducer from "./slices/agencyApplicationSlice";
import influencerApplicationReducer from "./slices/influencerApplicationSlice";
import bankDetailReducer from "./slices/bankDetailSlice";
import withdrawalReducer from "./slices/withdrawalSlice";
import walletReducer from "./slices/walletSlice";

import topupReducer from "./slices/topupSlice";
import salaryReducer from "./slices/salarySlice";
import paymentMethodReducer from "./slices/paymentMethodSlice";
import rechargeReducer from "./slices/rechargeSlice";
import adminUserReducer from "./slices/adminUserSlice";
import dashboardReducer from "./slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    complaints: complaintReducer,
    trainingApps: trainingAppReducer,
    countries: countryReducer,
    categories: categoryReducer,
    apps: appReducer,
    hostingApplications: hostingApplicationReducer,
    eventApplications: eventApplicationReducer,
    agencyApplications: agencyApplicationReducer,
    influencerApplications: influencerApplicationReducer,
    bankDetails: bankDetailReducer,
    withdrawals: withdrawalReducer,
    wallet: walletReducer,
    topups: topupReducer,
    salary: salaryReducer,
    paymentMethods: paymentMethodReducer,
    recharges: rechargeReducer,
    adminUsers: adminUserReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
