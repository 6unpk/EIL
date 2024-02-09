import { NotionAPI } from 'notion-client';

import * as fsp from 'fs/promises';
import * as Sitemap from 'sitemap';
import * as stream from 'stream' ;
import { rootNotionPageId } from './config';

const notion = new NotionAPI();

export const createSiteMap = async () => {
    const pages = [];
    const recordMap = await notion.getPage(rootNotionPageId);
    Object.keys(recordMap.block).map((blockId) => {
      const { id, type: blockType, properties: prop, last_edited_time: updatedAt } = recordMap.block[blockId].value;
      try {
        if (blockType === 'page' && prop?.title) {
          pages.push({ url: `/${id}`, changefreq: 'weekly', priority: 1, lastmod: (new Date(updatedAt)).toISOString() });
        }  
      } catch {}
    });
  
    const _stream = new Sitemap.SitemapStream( { hostname: 'https://eil.6unu.net' } );
    const sitemap = await Sitemap.streamToPromise(stream.Readable.from(pages).pipe(_stream)).then((data) => data.toString());
    await fsp.writeFile('./public/sitemap.xml', sitemap);
};