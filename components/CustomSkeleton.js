// CustomSkeleton.js
import React from 'react';
import { View, StyleSheet } from 'react-native';

const CustomSkeleton = ({ style }) => {
  return <View style={[styles.skeleton, style]} />;
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
});

export default CustomSkeleton;
