import { View, Text, TextInput } from "react-native";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import CustomButton from "./CustomButton";
import { useVideo } from "../store/video";
import Result from "./Result";

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
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={{
                padding: 10,
              }}
              className="border border-slate-400 px-2 rounded-lg shadow py-2 w-full mt-2 focus:border-2 focus:border-primary focus:ring-4 focus:ring-primary"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Paste URL / link here"
            />
          )}
          name="url"
        />
        {errors.url && (
          <Text className="text-red-500">{errors.url.message}</Text>
        )}
        {notTiktokLink && (
          <Text className="text-red-500">Please enter a valid TikTok URL</Text>
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
