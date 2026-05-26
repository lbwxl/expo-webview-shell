import { StatusBar } from 'expo-status-bar';
import { type CSSProperties, useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const IS_WEB = Platform.OS === 'web';
const DEV_TARGET_URL = 'http://192.168.0.5:5500/index.html';
const PROD_TARGET_URL = 'https://lbwxl.github.io/website-xy/';
const TARGET_URL = __DEV__ ? DEV_TARGET_URL : DEV_TARGET_URL;
const WEBVIEW_SOURCE = { uri: TARGET_URL };

const WEB_IFRAME_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  border: 'none',
  backgroundColor: '#fff',
};

export default function App() {
  const webviewRef = useRef<WebView>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadSeed, setReloadSeed] = useState(0);

  const onRetry = useCallback(() => {
    setLoadError(null);
    if (IS_WEB) {
      setReloadSeed((prev) => prev + 1);
      return;
    }
    webviewRef.current?.reload();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.webviewContainer}>
        {IS_WEB ? (
          <iframe
            key={`web-${reloadSeed}`}
            src={TARGET_URL}
            style={WEB_IFRAME_STYLE}
            title="embedded-web-app"
            onLoad={() => setLoadError(null)}
            onError={() => setLoadError('页面加载失败，请刷新重试')}
          />
        ) : (
          <WebView
            key={`native-${reloadSeed}`}
            ref={webviewRef}
            source={WEBVIEW_SOURCE}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            onLoadStart={() => setLoadError(null)}
            onError={(event) => {
              setLoadError(event.nativeEvent.description || '网络异常，请稍后重试');
            }}
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#0B57D0" />
                <Text style={styles.loadingText}>页面加载中...</Text>
              </View>
            )}
          />
        )}

        {loadError ? (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorTitle}>页面加载失败</Text>
            <Text style={styles.errorText}>{loadError}</Text>
            <Pressable onPress={onRetry} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>重试</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#4A5568',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    color: '#4A5568',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#0B57D0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
