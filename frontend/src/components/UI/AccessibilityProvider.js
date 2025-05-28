"use client";

import React from "react";
import { Provider } from 'react-redux';

import store from '@/store/accessibility-slice';

const AccessibilityProvider = ({ children }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};
export default AccessibilityProvider;
