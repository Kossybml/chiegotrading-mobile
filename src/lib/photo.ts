import * as ImagePicker from 'expo-image-picker';
import { ActionSheetIOS, Alert, Platform } from 'react-native';

/** Camera or gallery, then crop square. */
export async function pickPhoto(source: 'camera' | 'gallery', square = true): Promise<string | null> {
  const perm = source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Permission needed', `Allow ${source === 'camera' ? 'camera' : 'photo'} access in Settings to continue.`);
    return null;
  }
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: square ? [1, 1] : [4, 3], quality: 0.8 };
  const r = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  return r.canceled ? null : r.assets[0].uri;
}

export function choosePhoto(onPick: (uri: string) => void, square = true) {
  const run = async (s: 'camera' | 'gallery') => {
    const uri = await pickPhoto(s, square);
    if (uri) onPick(uri);
  };
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions({ options: ['Take photo', 'Choose from library', 'Cancel'], cancelButtonIndex: 2 }, (i) => i === 0 ? run('camera') : i === 1 ? run('gallery') : undefined);
  } else {
    Alert.alert('Photo', undefined, [{ text: 'Take photo', onPress: () => run('camera') }, { text: 'Choose from gallery', onPress: () => run('gallery') }, { text: 'Cancel', style: 'cancel' }]);
  }
}

