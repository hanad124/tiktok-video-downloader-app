import React, { useState } from "react";
import { View, Text, Image, Button, Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import prettyBytes from "pretty-bytes";
import { LinearGradient } from "expo-linear-gradient";
import CustomSkeleton from "./CustomSkeleton";
import CustomButton from "./CustomButton";

const Result = ({ video, loading, notTiktokLink }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSize, setDownloadSize] = useState(0);

  const downloadVideo = async (url, filename) => {
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "You need to grant permission to save the video."
      );
      return;
    }

    if (Platform.OS === "android") {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to grant directory access to save the video."
        );
        return;
      }

      setIsDownloading(true);
      setDownloadProgress(0);

      const path = `${FileSystem.documentDirectory}${filename}.mp4`;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        path,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
          setDownloadSize(downloadProgress.totalBytesExpectedToWrite);
        }
      );

      try {
        const { uri } = await downloadResumable.downloadAsync();

        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const safUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          `${filename}.mp4`,
          "video/mp4"
        );

        await FileSystem.writeAsStringAsync(safUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert(
          "Download Success",
          "Video has been saved to the selected directory."
        );
      } catch (error) {
        console.error(error);
        Alert.alert(
          "Download Failed",
          "An error occurred while downloading the video."
        );
      } finally {
        setIsDownloading(false);
      }
    } else {
      setIsDownloading(true);
      setDownloadProgress(0);

      const path = `${FileSystem.documentDirectory}${filename}.mp4`;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        path,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
          setDownloadSize(downloadProgress.totalBytesExpectedToWrite);
        }
      );

      try {
        const { uri } = await downloadResumable.downloadAsync();
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync("Download", asset, false);

        Alert.alert(
          "Download Success",
          "Video has been saved to your media library."
        );
      } catch (error) {
        console.error(error);
        Alert.alert(
          "Download Failed",
          "An error occurred while downloading the video."
        );
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const noVideoData = !video || Object.keys(video).length === 0;

  return (
    <View
      className={`flex items-center mt-10 ${
        !noVideoData && "border"
      } border-[#e8e8e8] rounded-lg`}
    >
      {!noVideoData && (
        <View className="w-full max-w-md bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
          <Image
            source={{ uri: video?.ai_dynamic_cover }}
            style={{
              width: "100%",
              height: 200,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
            resizeMode="cover"
          />
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <View className="border-[2px] border-primary rounded-full p-[1px] ">
                <Image
                  source={{ uri: video.author.avatar }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    marginRight: 0,
                  }}
                />
              </View>
              <Text className="font-bold text-gray-700 ml-4">
                {video.author.nickname} | {video.author.unique_id}
              </Text>
            </View>
            <Text className="text-gray-600 mb-2">
              {video.title.slice(0, 80) +
                (video.title.length > 80 ? "..." : "")}
            </Text>
            <View className="">
              {isDownloading ? (
                <>
                  {/* Simple Progress Bar */}
                  <View
                    style={{
                      height: 7,
                      backgroundColor: "#e0e0e0", // Background color of the bar
                      borderRadius: 5,
                      overflow: "hidden",
                      marginBottom: 10,
                      marginTop: 10,
                    }}
                  >
                    <View
                      style={{
                        width: `${downloadProgress * 100}%`, // Progress width based on download progress
                        height: "100%",
                        backgroundColor: "#6200ea", // Foreground color of the progress
                        borderRadius: 5,
                        transition: "width 0.5s ease", // Smooth transition for progress
                      }}
                    />
                  </View>
                  <View className="flex-row justify-between mt-2">
                    <Text>{prettyBytes(downloadSize)}</Text>
                    <Text>{Math.round(downloadProgress * 100)}%</Text>
                  </View>
                </>
              ) : (
                <CustomButton
                  text="Save Video"
                  handlePress={() => downloadVideo(video.play, video.id)}
                  containerStyles={`w-full mt-6 flex items-center gap-2 justify-center`}
                  isLoading={loading}
                  loadingState={"Loading..."}
                />
              )}
            </View>
          </View>
        </View>
      )}
      {loading && (
        <View className="w-full max-w-md bg-white rounded-lg border border-[#e8e8e8] shadow-lg mb-6 p-4">
          <CustomSkeleton
            style={{ width: "100%", height: 200, borderRadius: 10 }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <CustomSkeleton
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
            <View style={{ marginLeft: 10 }}>
              <CustomSkeleton
                style={{ width: 120, height: 20, borderRadius: 4 }}
              />
              <CustomSkeleton
                style={{
                  width: 80,
                  height: 20,
                  borderRadius: 4,
                  marginTop: 6,
                }}
              />
            </View>
          </View>
          <CustomSkeleton
            style={{ width: 250, height: 20, borderRadius: 4, marginTop: 10 }}
          />
          <CustomSkeleton
            style={{ width: 200, height: 20, borderRadius: 4, marginTop: 6 }}
          />
        </View>
      )}
      {notTiktokLink && (
        <View className="w-full max-w-md bg-red-100 p-4 rounded-lg border border-red-400 flex items-center">
          <Text className="text-red-500">
            Invalid TikTok link, please enter a valid link.
          </Text>
        </View>
      )}
    </View>
  );
};

export default Result;
