import { View, Text, TextInput } from "react-native";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import CustomButton from "./CustomButton";
import { useVideo } from "../store/video";
import Result from "./Result";

import { Link } from "lucide-react-native";
import { useState } from "react";

const Schema = yup.object().shape({
  url: yup
    .string()
    .min(1, "Please enter a valid URL")
    .url("Please enter a valid URL")
    .matches(
      /^(https?:\/\/)?(www\.)?(vm.tiktok\.com)\/.+$/,
      "Please enter a valid TikTok URL"
    )
    .required("URL is required"),
});

const Field = () => {
  const fetchVideo = useVideo((state) => state.fetchVideo);
  const clearVideo = useVideo((state) => state.clearVideo); // Get the clearVideo action
  const loading = useVideo((state) => state.loading);
  const video = useVideo((state) => state.video);
  const notTiktokLink = useVideo((state) => state.notTiktokLink);

  const [isFocused, setIsFocused] = useState(false); // State to track focus

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(Schema),
  });

  const onSubmit = async (data) => {
    await fetchVideo(data.url);
  };

  const handleClear = () => {
    // Clear the video state
    clearVideo();
    // Reset the form input field
    reset();
  };

  return (
    <View className="mt-10">
      <View className="mt-4">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderColor: isFocused ? "#6200ea" : "#cbd5e0", // Change border color when focused
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
            paddingVertical: 4,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
          }}
        >
          {/* Link Icon from lucide-react-native */}
          <Link
            color={isFocused ? "#6200ea" : "#9DB2BF"}
            size={20}
            style={{ marginRight: 10 }}
          />

          {/* TextInput with Controller */}
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{
                  flex: 1, // Take remaining space
                  paddingVertical: 8,
                  paddingHorizontal: 0, // Remove horizontal padding so it aligns with the icon
                  fontSize: 16,
                  color: "#4a4a4a",
                }}
                onBlur={() => {
                  onBlur();
                  setIsFocused(false); // Remove focus effect
                }}
                onFocus={() => setIsFocused(true)} // Apply focus effect
                onChangeText={onChange}
                value={value}
                placeholder="Paste URL / link here"
                placeholderTextColor="#999"
              />
            )}
            name="url"
          />
        </View>

        {/* Display error messages */}
        {errors.url && (
          <Text className="text-red-500 mt-2">{errors.url.message}</Text>
        )}
        {notTiktokLink && (
          <Text className="text-red-500 mt-2">
            Please enter a valid TikTok URL
          </Text>
        )}
      </View>
      <View className="flex flex-row w-full items-center justify-center gap-2">
        <View className="flex-1">
          <CustomButton
            text={`Download Video`}
            handlePress={handleSubmit(onSubmit)}
            containerStyles={`w-full mt-6 flex items-center gap-2 justify-center`}
            isLoading={loading}
            loadingState={"Loading..."}
          />
        </View>
        <View className="flex-3 flex">
          <View
            className="flex justify-center items-center bg-gray-300 px-5 py-4 rounded-lg -mb-6"
            onTouchEnd={handleClear}
          >
            <Text className="text-black font-medium">Clear</Text>
          </View>
        </View>
      </View>

      <Result video={video} loading={loading} notTiktokLink={notTiktokLink} />
    </View>
  );
};

export default Field;
