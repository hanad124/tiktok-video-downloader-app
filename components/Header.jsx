import { View, Text } from "react-native";
import React from "react";

const Header = () => {
  return (
    <View className="mt-24">
      <Text className="text-center text-3xl text-primary font-pbold">
        TokGrab
      </Text>
      <Text className="mt-2 mx-6 leading-[20px] text-center">
        Download TikTok videos without watermark in high quality.
      </Text>
    </View>
  );
};

export default Header;
