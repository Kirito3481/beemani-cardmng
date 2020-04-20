import Koa from 'koa';
import Iconv from 'iconv-lite';
import { create as XML } from 'xmlbuilder2';
import { Encrypt as Rc4 } from 'konami-rc4';
import { compress as Lz77 } from "lz77-wasm/lz77_wasm";
import { encode as KBinXML } from 'kbinxml-wasm/pkg/kbinxml_wasm';

declare module 'koa' {
  interface ExtendableContext {
    send(data: Object): void;
  }
}

export default async (ctx: Koa.ExtendableContext, next: Koa.Next) => {
  const x_eamuse_info = String(ctx.get('x-eamuse-info'));
  const x_compress = ctx.get('x-compress');

  ctx.send = (data: Object) => {
    const xmlData = XML({ response: SortObject(data) }).dec({ encoding: 'SHIFT_JIS' }).end({});

    console.info(xmlData);

    let buf = Buffer.from(KBinXML(Iconv.encode(xmlData, 'shift-jis')), 'base64');

    const rawSize = buf.length;
    const compressed = Buffer.from(Lz77(buf), 'base64');

    if (rawSize > compressed.length) {
      buf = compressed;
      ctx.set('x-compress', 'lz77');
    } else {
      ctx.set('x-compress', 'none');
    }

    if (x_eamuse_info.length > 0 || x_eamuse_info !== '') {
      buf = Rc4(buf, x_eamuse_info);
      ctx.set('x-eamuse-info', x_eamuse_info);
    }

    console.info(
      ctx.request.url,
      x_eamuse_info,
      x_compress,
      rawSize,
      compressed.length
    );

    ctx.body = buf;
  };

  await next();
}

function SortObject(obj: { [key: string]: any }) {
  return Object.keys(obj)
    .sort()
    .reduce((acc: { [key: string]: any }, key) => {
      let item = obj[key];
      if (typeof item === 'object') {
        if (Array.isArray(item)) {
          item.sort();
        } else {
          item = SortObject(item);
        }
      }
      acc[key] = item;

      return acc;
    }, {});
}
