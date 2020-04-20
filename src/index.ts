import Koa from 'koa';
import Body from 'koa-body';
import Logger from 'koa-logger';
import Parser from 'fast-xml-parser';

import CardManager from './cardmng';
import XmlSend from "./XmlSend";

const app = new Koa();

app.use(Body({ json: true }));
app.use(Logger());

app.use(async (ctx, next) => {
  ctx.request.body.XMLBody = Parser.parse(ctx.request.body.xml,
    { attributeNamePrefix: '@', ignoreAttributes: false }
  );

  await next();
});

app.use(XmlSend);

app.use(CardManager.routes()).use(CardManager.allowedMethods());

app.listen(process.env.PORT, () => {
  console.info('Listening on Port', process.env.PORT);
});
