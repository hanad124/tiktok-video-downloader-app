import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import Field from "../components/Field";
import Footer from "../components/Footer";
function index() {
  return (
    <SafeAreaView className="bg-white py-0">
      <ScrollView className="bg-white">
        <View className="w-full mt-0  bg-white px-6 min-h-screen  ">
          <Header />
          <Field />
        </View>
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

export default index;
