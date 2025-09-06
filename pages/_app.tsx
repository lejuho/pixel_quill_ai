import '../styles/globals.css'; // 1단계에서 만든 전역 CSS 파일

import type { AppProps } from 'next/app';
import Layout from '../layout'; // 기존 layout.js 컴포넌트

function MyApp({ Component, pageProps }: AppProps) {
  // `Layout` 컴포넌트에 현재 페이지 이름을 전달합니다.
  const currentPageName = Component.name || 'Page';
  
  return (
    <Layout currentPageName={currentPageName}>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;