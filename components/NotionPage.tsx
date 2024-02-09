import * as React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { ExtendedRecordMap } from "notion-types";
import { getPageTitle } from "notion-utils";
import { NotionRenderer } from "react-notion-x";
import TweetEmbed from "react-tweet-embed";

import { Loading } from "./Loading";

const Code = dynamic(() =>
  import("react-notion-x/build/third-party/code").then(
    (m) => m.Code
  )
);

const Collection = dynamic(() =>
  import("react-notion-x/build/third-party/collection").then(
    (m) => m.Collection
  )
);
const Equation = dynamic(() =>
  import("react-notion-x/build/third-party/equation").then((m) => m.Equation)
);
const Pdf = dynamic(
  () => import("react-notion-x/build/third-party/pdf").then((m) => m.Pdf),
  {
    ssr: false,
  }
);
const Modal = dynamic(
  () => import("react-notion-x/build/third-party/modal").then((m) => m.Modal),
  {
    ssr: false,
  }
);

const Tweet = ({ id }: { id: string }) => {
  return <TweetEmbed tweetId={id} />;
};

const loadStructuredDataSchema = (title: string, date: Date) => {
  return {
    __html: `
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${title}",
      "datePublished": "${date.toISOString()}",
      "dateModified": "${date.toISOString()}"
    }
    `,
  };
}

const getPagePublished = (recordMap: ExtendedRecordMap): Date | null => {
  const blockIds = Object.keys(recordMap.block);
  for (const blockId of blockIds) {
    const { value: block } = recordMap.block[blockId];
    try {
      if (block.type === 'page') {
        return new Date(block.last_edited_time);
      }  
    } catch { return null; }
  }
  return null;
}

export const NotionPage = ({
  recordMap,
  previewImagesEnabled,
  rootPageId,
  rootDomain,
}: {
  recordMap: ExtendedRecordMap;
  previewImagesEnabled?: boolean;
  rootPageId?: string;
  rootDomain?: string;
}) => {
  const router = useRouter();

  if (router.isFallback) {
    return <Loading />;
  }

  if (!recordMap) {
    return null;
  }

  const title = getPageTitle(recordMap);
  if (typeof window !== "undefined") {
    const keys = Object.keys(recordMap?.block || {});
    const block = recordMap?.block?.[keys[0]]?.value;
    const g = window as any;
    g.recordMap = recordMap;
    g.block = block;
  }

  const socialDescription = "Every time i learned";

  return (
    <>
      <Head>
        {socialDescription && (
          <>
            <meta name="description" content={socialDescription} />
            <meta property="og:description" content={socialDescription} />
            <meta name="twitter:description" content={socialDescription} />
          </>
        )}

        <title>{title}</title>
        <meta property='og:type' content='website' />
        <meta property="og:title" content={title} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:creator" content="@transitive_bs" />
        <link rel="icon" href="/favicon.ico" />
        <script
					type='application/ld+json'
					dangerouslySetInnerHTML={loadStructuredDataSchema(title, getPagePublished(recordMap) ?? new Date())}
				></script>
      </Head>

      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={false}
        rootDomain={rootDomain}
        rootPageId={rootPageId}
        previewImages={previewImagesEnabled}
        components={{
          nextLink: Link,
          Code,
          Collection,
          Equation,
          Pdf,
          Modal,
          Tweet,
        }}
      />
    </>
  );
};
