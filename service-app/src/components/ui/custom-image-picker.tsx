import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type AppImagePickerProps = {
    imageUri: string | null;
    onImageSelect: (uri: string) => void;
    disabled?: boolean;
};

const CustomImagePicker: React.FC<AppImagePickerProps> = ({
    imageUri,
    onImageSelect,
    disabled = false,
}) => {
    const [fileName, setFileName] = useState<string>('');

    const handlePickImage = async () => {
        if (disabled) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets[0]?.uri) {
            const uriParts = result.assets[0].uri.split('/');
            const selectedFileName = uriParts[uriParts.length - 1];
            setFileName(selectedFileName);
            onImageSelect(result.assets[0].uri);
        }
    };

    return (
        <View className="flex items-center justify-center w-full py-4 bg-white">
            <TouchableOpacity
                className={`w-32 h-32 rounded-lg justify-center items-center border border-gray-300 ${disabled ? 'opacity-50' : ''
                    }`}
                onPress={handlePickImage}
                disabled={disabled}
            >
                {imageUri ? (
                    <Image source={{ uri: imageUri }} className="w-full h-full rounded-lg" />
                ) : (
                    <Text className="text-gray-200 text-6xl text-center">+</Text>
                )}
            </TouchableOpacity>

            <View className="flex-1 ml-4 justify-center">
                {fileName && <Text className="mb-2 text-sm font-semibold text-gray-600">{fileName}</Text>}
                {imageUri && (
                    <TouchableOpacity
                        onPress={handlePickImage}
                        disabled={disabled}
                        className={`px-4 py-2 justify-center bg-orange-500 rounded-lg ${disabled ? 'opacity-50' : ''}`}
                    >
                        <Text className="text-white text-center text-sm font-medium">Change Image</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default CustomImagePicker;
