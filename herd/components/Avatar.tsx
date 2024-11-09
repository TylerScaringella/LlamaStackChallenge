import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, Image, Text, TouchableOpacity } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import styled from 'styled-components/native'
import colors from './colors';

interface Props {
  size: number
  url: string | null
  onUpload: (filePath: string) => void
}

export default function Avatar({ url, size = 150, onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const avatarSize = { height: size, width: size }

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)
      if (error) throw error

      const fr = new FileReader()
      fr.readAsDataURL(data)
      fr.onload = () => setAvatarUrl(fr.result as string)
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error downloading image: ', error.message)
      }
    }
  }

  async function uploadAvatar() {
    try {
      setUploading(true)

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      })

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.')
        return
      }

      const image = result.assets[0]
      if (!image.uri) throw new Error('No image uri!')

      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer())
      const fileExt = image.uri.split('.').pop()?.toLowerCase() ?? 'jpeg'
      const path = `${Date.now()}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, { contentType: image.mimeType ?? 'image/jpeg' })

      if (uploadError) throw uploadError

      onUpload(data.path)
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <PositionedContainer style={avatarSize}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          accessibilityLabel="Avatar"
          style={[avatarSize, styles.avatar, styles.image]}
        />
      ) : (
        <View style={[avatarSize, styles.avatar, styles.noImage]} />
      )}
      <StyledButton onPress={uploadAvatar} disabled={uploading}>
        <ButtonText>{'Add profile photo'}</ButtonText>
      </StyledButton>
    </PositionedContainer>
  )
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 1000,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  image: {
    objectFit: 'cover',
  },
  noImage: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: colors.brown,
    borderRadius: 1000,
  },
})

const PositionedContainer = styled.View`
  position: relative;
  align-items: center;
  justify-content: center;
`

const StyledButton = styled(TouchableOpacity)`
  /* background-color: #820c0c; */
  position: absolute;
  /* padding: 10px 20px; */
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`

const ButtonText = styled(Text)`
  color: ${colors.brown};
  font-size: 14px;
  font-weight: normal;
  font-family: 'Merriweather';
  text-align: center;
`
