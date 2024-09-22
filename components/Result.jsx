import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  Platform,
  TouchableOpacity,
  Modal,
  Button,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import prettyBytes from "pretty-bytes";
import { BlurView } from "expo-blur"; // Import BlurView
import CustomSkeleton from "./CustomSkeleton";
import CustomButton from "./CustomButton";

import { FileVideo, FileAudio } from "lucide-react-native";

const Result = ({ video, loading, notTiktokLink }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSize, setDownloadSize] = useState(0);
  const [activeTab, setActiveTab] = useState("video");
  const [modalVisible, setModalVisible] = useState(false); // State for controlling the modal visibility

  // Download functionality remains the same
  const downloadFile = async (url, filename, type) => {
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        `You need to grant permission to save the ${type}.`
      );
      return;
    }

    if (Platform.OS === "android") {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        Alert.alert(
          "Permission Denied",
          `You need to grant directory access to save the ${type}.`
        );
        return;
      }

      setIsDownloading(true);
      setDownloadProgress(0);

      const path = `${FileSystem.documentDirectory}${filename}.${
        type === "audio" ? "mp3" : "mp4"
      }`;

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
          `${filename}.${type === "audio" ? "mp3" : "mp4"}`,
          type === "audio" ? "audio/mpeg" : "video/mp4"
        );

        await FileSystem.writeAsStringAsync(safUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert(
          "Download Success",
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } has been saved to the selected directory.`
        );
      } catch (error) {
        console.error(error);
        Alert.alert(
          "Download Failed",
          `An error occurred while downloading the ${type}.`
        );
      } finally {
        setIsDownloading(false);
      }
    } else {
      setIsDownloading(true);
      setDownloadProgress(0);

      const path = `${FileSystem.documentDirectory}${filename}.${
        type === "audio" ? "mp3" : "mp4"
      }`;

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
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } has been saved to your media library.`
        );
      } catch (error) {
        console.error(error);
        Alert.alert(
          "Download Failed",
          `An error occurred while downloading the ${type}.`
        );
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const noVideoData = !video || Object.keys(video).length === 0;

  const renderTabContent = () => {
    if (activeTab === "video") {
      return (
        <View className="w-full max-w-md bg-white rounded-lg shadow-lg mb-6 overflow-hidden p-4">
          <View className="rounded-lg overflow-hidden mb-4 ">
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
          </View>
          <View>
            <View className="flex-row items-center mb-4">
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <View className="border-2 p-[1px] border-primary rounded-full">
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
              </TouchableOpacity>
              <Text className="font-bold text-gray-700 ml-4">
                {video.author.nickname} | {video.author.unique_id}
              </Text>
            </View>
            <Text className="text-gray-600">
              {video.title.slice(0, 120) +
                (video.title.length > 120 ? "..." : "")}
            </Text>
            <View>
              {isDownloading ? (
                <>
                  <View
                    style={{
                      height: 7,
                      backgroundColor: "#e0e0e0",
                      borderRadius: 5,
                      overflow: "hidden",
                      marginBottom: 10,
                      marginTop: 10,
                    }}
                  >
                    <View
                      style={{
                        width: `${downloadProgress * 100}%`,
                        height: "100%",
                        backgroundColor: "#6200ea",
                        borderRadius: 5,
                        transition: "width 0.5s ease",
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
                  handlePress={() =>
                    downloadFile(video.play, video.id, "video")
                  }
                  containerStyles={`w-full mt-0 flex items-center gap-2 justify-center`}
                  isLoading={loading}
                  loadingState={"Loading..."}
                />
              )}
            </View>
          </View>
        </View>
      );
    } else if (activeTab === "audio") {
      return (
        <View className="w-full max-w-md bg-white rounded-lg shadow-lg mb-6 p-4">
          <View>
            <Text className="text-center mb-2 text-sm font-pmedium">
              Original Sound
            </Text>
          </View>
          <Text
            className="text-gray-800 font-psemibold mb-2 text-center
          "
          >
            {video.music_info?.title || "Unknown Audio"} || By
          </Text>
          <View className="flex-row items-center mb-4">
            <Image
              source={{ uri: video.music_info?.cover }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                marginRight: 0,
              }}
            />
            <Text className="font-bold text-gray-700 ml-4">
              {video.music_info?.author || "Unknown Artist"}
            </Text>
          </View>
          <View>
            <CustomButton
              text="Save Audio"
              handlePress={() =>
                downloadFile(
                  video.music_info?.play,
                  video.music_info?.id,
                  "audio"
                )
              }
              containerStyles={`w-full mt-0 flex items-center gap-2 justify-center`}
              isLoading={loading}
              loadingState={"Loading..."}
            />
          </View>
        </View>
      );
    }
  };

  return (
    <View
      className={`flex items-center mt-10 bg-white ${
        !noVideoData && "border"
      } border-[#e8e8e8] rounded-lg`}
    >
      <View className="flex-row justify-center mb-4 gap-x-2">
        <TouchableOpacity
          onPress={() => setActiveTab("video")}
          style={{
            padding: 10,
            borderBottomWidth: activeTab === "video" ? 2 : 0,
            borderBottomColor: "#6200ea",
          }}
          className="flex flex-row items-center gap-2"
        >
          <FileVideo
            color={activeTab === "video" ? "#6200ea" : "#000"}
            size={20}
          />
          <Text
            style={{
              color: activeTab === "video" ? "#6200ea" : "#000",
              fontWeight: activeTab === "video" ? "bold" : "normal",
            }}
          >
            Video
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("audio")}
          style={{
            padding: 10,
            borderBottomWidth: activeTab === "audio" ? 2 : 0,
            borderBottomColor: "#6200ea",
          }}
          className="flex flex-row items-center gap-2"
        >
          <FileAudio
            color={activeTab === "audio" ? "#6200ea" : "#000"}
            size={20}
          />

          <Text
            style={{
              color: activeTab === "audio" ? "#6200ea" : "#000",
              fontWeight: activeTab === "audio" ? "bold" : "normal",
            }}
          >
            Audio
          </Text>
        </TouchableOpacity>
      </View>

      {!noVideoData && renderTabContent()}

      {/* Modal for the user profile */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        {/* Blurred Background */}
        <BlurView
          intensity={100}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.8)",
            }}
          >
            <View
              style={{
                width: 350,
                padding: 20,
                marginHorizontal: 50,
                backgroundColor: "white",
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <View className="-mt-20 border-[3px] p-[1px] rounded-full border-primary">
                <Image
                  source={{ uri: video.author.avatar }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
              </View>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 10 }}>
                {video.author.nickname}
              </Text>
              <Text style={{ fontSize: 16, color: "gray", marginBottom: 20 }}>
                @{video.author.unique_id}
              </Text>

              <View className="flex flex-row items-center justify-center">
                <View></View>
                <View></View>
                <View></View>
              </View>
              {/* <Button title="Close" onPress={() => setModalVisible(false)} /> */}
              <CustomButton
                text={"Close"}
                handlePress={() => setModalVisible(false)}
              ></CustomButton>
            </View>
          </View>
        </BlurView>
      </Modal>

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
