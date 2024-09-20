import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
  ToastAndroid,
  Linking,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import Field from "../components/Field";
function index() {
  return (
    <SafeAreaView className="bg-white py-5 px-6">
      <ScrollView className="bg-white">
        <View className="w-full  min-h-[90vh]  my-6 mt-0  bg-white">
          <Header />
          <Field />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default index;
