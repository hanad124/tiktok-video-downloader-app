import React, { useState } from 'react';
import { View, Text, Image, Button, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import prettyBytes from 'pretty-bytes';
import CustomSkeleton from './CustomSkeleton';

const Result = ({ video, loading, notTiktokLink }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSize, setDownloadSize] = useState(0);

  const downloadVideo = async (url, filename) => {
    setIsDownloading(true);
    setDownloadProgress(0);

    const path = `${FileSystem.documentDirectory}SaveTok-${filename}.mp4`;

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      path,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        setDownloadProgress(progress);
        setDownloadSize(downloadProgress.totalBytesExpectedToWrite);
      }
    );

    try {
      const { uri } = await downloadResumable.downloadAsync();
      Alert.alert('Download Success', `Video has been downloaded successfully to ${uri}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Download Failed', 'An error occurred while downloading the video.');
    } finally {
      setIsDownloading(false);
    }
  };

  const noVideoData = !video || Object.keys(video).length === 0;

  return (
    <View className="flex items-center">
      {!noVideoData && (
        <View className="w-full max-w-md bg-white rounded-lg shadow-lg mb-6">
          <Image
            source={{ uri: video?.cover }}
            style={{ width: '100%', height: 200, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
            resizeMode="cover"
          />
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <Image
                source={{ uri: video.author.avatar }}
                style={{ width: 48, height: 48, borderRadius: 24, marginRight: 8 }}
              />
              <Text className="font-bold text-gray-700">
                {video.author.nickname} | {video.author.unique_id}
              </Text>
            </View>
            <Text className="text-gray-600 mb-4">
              {video.title.slice(0, 80) + (video.title.length > 80 ? '...' : '')}
            </Text>
            <View className="mt-4">
              {isDownloading ? (
                <>
                  <LinearGradient
                    colors={['#6a1b9a', '#8e44ad']}
                    start={[0, 0]}
                    end={[1, 1]}
                    style={{ height: 10, borderRadius: 5, marginBottom: 10 }}
                  >
                    <View style={{ width: `${downloadProgress * 100}%`, height: '100%' }} />
                  </LinearGradient>
                  <View className="flex-row justify-between mt-2">
                    <Text>{prettyBytes(downloadSize)}</Text>
                    <Text>{Math.round(downloadProgress * 100)}%</Text>
                  </View>
                </>
              ) : (
                <Button title="Download" onPress={() => downloadVideo(video.play, video.id)} color="#6200ea" />
              )}
              {isDownloading && <Button title="Cancel" onPress={() => { /* handle cancel logic here */ }} color="#d32f2f" />}
            </View>
          </View>
        </View>
      )}
      {loading && (
        <View className="w-full max-w-md bg-white rounded-lg shadow-lg mb-6 p-4">
          <CustomSkeleton style={{ width: '100%', height: 200, borderRadius: 10 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <CustomSkeleton style={{ width: 48, height: 48, borderRadius: 24 }} />
            <View style={{ marginLeft: 10 }}>
              <CustomSkeleton style={{ width: 120, height: 20, borderRadius: 4 }} />
              <CustomSkeleton style={{ width: 80, height: 20, borderRadius: 4, marginTop: 6 }} />
            </View>
          </View>
          <CustomSkeleton style={{ width: 250, height: 20, borderRadius: 4, marginTop: 10 }} />
          <CustomSkeleton style={{ width: 200, height: 20, borderRadius: 4, marginTop: 6 }} />
        </View>
      )}
      {notTiktokLink && (
        <View className="w-full max-w-md bg-red-100 p-4 rounded-lg border border-red-400 flex items-center">
          <Text className="text-red-500">Invalid TikTok link, please enter a valid link.</Text>
        </View>
      )}
    </View>
  );
};

export default Result;
