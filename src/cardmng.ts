import Router from 'koa-router';
import Card from 'beemani-database/dist/models/card';

const router = new Router();

router.post('/cardmng/inquire', async (ctx) => {
  const model = ctx.request.body.model.split(':')[0];
  const cardId = String(ctx.request.body.XMLBody.call.cardmng['@cardid']);

  ctx.send({ cardmng: await Card.findCard(cardId, model) });
});

router.post('/cardmng/authpass', async (ctx) => {
  const refId = String(ctx.request.body.XMLBody.call.cardmng['@refid']);
  const passwd = Number(ctx.request.body.XMLBody.call.cardmng['@pass']);

  ctx.send({ cardmng: await Card.ValidatePassword(refId, passwd) });
});

router.post('/cardmng/getrefid', async (ctx) => {
  const cardId = String(ctx.request.body.XMLBody.call.cardmng['@cardid']);
  const cardType = Number(ctx.request.body.XMLBody.call.cardmng['@cardtype']);
  const passwd = Number(ctx.request.body.XMLBody.call.cardmng['@passwd']);
  const newflag = Number(ctx.request.body.XMLBody.call.cardmng['@newflag']);

  ctx.send({ cardmng: await Card.RegistCard(cardId, cardType, passwd, newflag) });
});

router.post('/cardmng/bindmodel', async (ctx) => {
  const refId = String(ctx.request.body.XMLBody.call.cardmng['@refid']);

  ctx.send({ cardmng: await Card.BindModel(refId, ctx.request.body.model.split(':')[0]) });
})

export default router;
