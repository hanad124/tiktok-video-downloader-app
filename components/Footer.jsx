import { View, Text } from "react-native";
import React from "react";
import { Link } from "expo-router";

const Footer = () => {
  return (
    <View className="mt-10 bottom-0 relative">
      <View className="h-[.7px] w-full bg-[#d7d8d8]"></View>
      <View className="px-6 py-5 flex flex-row gap-1 items-center justify-center">
        <Text>Made with ❤️ by</Text>
        <Link href={"https://github.com/hanad124"}>
          <Text className="font-bold">Hanad Faruq</Text>
        </Link>
      </View>
    </View>
  );
};

export default Footer;
