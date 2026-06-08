const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5174;
const dbPath = path.join(__dirname, 'db.json');

function readDb() {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  db.addresses = db.addresses || [];
  db.favorites = db.favorites || [];
  db.reviews = db.reviews || [];
  db.orders = db.orders || [];
  return db;
}

function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
}

function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, Number(item.id || 0)), 0) + 1;
}

function orderStatusText(status) {
  return ({
    unpaid: '未支付',
    paid: '待发货',
    shipped: '已发货',
    received: '已收货',
    closed: '已关闭'
  })[status] || '未知状态';
}

function withStatusText(order) {
  return { ...order, statusText: orderStatusText(order.status), logisticsTraces: order.logisticsTraces || [] };
}

function safeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

function compactAddress(address) {
  if (!address) return '';
  return [address.province, address.city, address.detail].filter(Boolean).join('');
}

async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, {});

  const url = new URL(req.url, 'http://127.0.0.1');
  const pathname = url.pathname;
  const db = readDb();

  if (req.method === 'GET' && pathname === '/api/health') {
    return send(res, 200, { ok: true, message: 'Mock API is running' });
  }

  if (req.method === 'GET' && pathname === '/api/categories') {
    return send(res, 200, db.categories);
  }

  if (req.method === 'GET' && pathname === '/api/goods') {
    const includeOff = url.searchParams.get('includeOff') === 'true';
    const keyword = (url.searchParams.get('keyword') || '').trim().toLowerCase();
    const categoryId = url.searchParams.get('categoryId') || '';
    const list = db.goods.filter((good) => {
      const statusOk = includeOff || good.status !== 'off';
      const keywordOk = !keyword || good.name.toLowerCase().includes(keyword);
      const categoryOk = !categoryId || good.categoryId === categoryId;
      return statusOk && keywordOk && categoryOk;
    });
    return send(res, 200, list);
  }

  const goodIdMatch = pathname.match(/^\/api\/goods\/(\d+)$/);
  if (req.method === 'GET' && goodIdMatch) {
    const good = db.goods.find((item) => item.id === Number(goodIdMatch[1]));
    return good && good.status !== 'off' ? send(res, 200, good) : send(res, 404, { message: '商品不存在或已下架' });
  }

  if (req.method === 'POST' && pathname === '/api/login') {
    const body = await readBody(req);
    const user = db.users.find((item) => item.username === body.username && item.password === body.password);
    return user ? send(res, 200, safeUser(user)) : send(res, 401, { message: '账号或密码错误' });
  }

  if (req.method === 'POST' && pathname === '/api/register') {
    const body = await readBody(req);
    if (db.users.some((item) => item.username === body.username)) return send(res, 409, { message: '用户名已存在' });
    const user = { id: nextId(db.users), username: body.username, password: body.password, nickname: body.nickname || body.username, phone: '' };
    db.users.push(user);
    writeDb(db);
    return send(res, 201, safeUser(user));
  }

  if (req.method === 'POST' && pathname === '/api/admin/login') {
    const body = await readBody(req);
    const admin = db.admins.find((item) => item.username === body.username && item.password === body.password);
    if (!admin) return send(res, 401, { message: '后台账号或密码错误' });
    const { password, ...safeAdmin } = admin;
    return send(res, 200, safeAdmin);
  }

  if (req.method === 'POST' && pathname === '/api/admin/goods') {
    const body = await readBody(req);
    const good = {
      id: nextId(db.goods),
      name: body.name,
      price: Number(body.price),
      categoryId: body.categoryId,
      stock: Number(body.stock || 0),
      status: body.status || 'on',
      img: body.img || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80',
      desc: body.desc || '后台新增商品。'
    };
    db.goods.push(good);
    writeDb(db);
    return send(res, 201, good);
  }

  const adminGoodMatch = pathname.match(/^\/api\/admin\/goods\/(\d+)$/);
  if (adminGoodMatch) {
    const id = Number(adminGoodMatch[1]);
    const index = db.goods.findIndex((item) => item.id === id);
    if (index === -1) return send(res, 404, { message: '商品不存在' });
    if (req.method === 'PUT') {
      const body = await readBody(req);
      db.goods[index] = { ...db.goods[index], ...body, id, price: Number(body.price), stock: Number(body.stock || 0) };
      writeDb(db);
      return send(res, 200, db.goods[index]);
    }
    if (req.method === 'DELETE') {
      const [deleted] = db.goods.splice(index, 1);
      db.cart = db.cart.filter((item) => item.goodId !== id);
      db.favorites = db.favorites.filter((item) => item.goodId !== id);
      writeDb(db);
      return send(res, 200, deleted);
    }
  }

  const statusMatch = pathname.match(/^\/api\/admin\/goods\/(\d+)\/status$/);
  if (req.method === 'PATCH' && statusMatch) {
    const good = db.goods.find((item) => item.id === Number(statusMatch[1]));
    if (!good) return send(res, 404, { message: '商品不存在' });
    good.status = good.status === 'off' ? 'on' : 'off';
    writeDb(db);
    return send(res, 200, good);
  }

  if (req.method === 'GET' && pathname === '/api/cart') {
    const userId = Number(url.searchParams.get('userId'));
    const list = db.cart
      .filter((item) => item.userId === userId)
      .map((item) => ({ ...item, good: db.goods.find((good) => good.id === item.goodId) }))
      .filter((item) => item.good);
    return send(res, 200, list);
  }

  if (req.method === 'POST' && pathname === '/api/cart') {
    const body = await readBody(req);
    const userId = Number(body.userId);
    const goodId = Number(body.goodId);
    const existing = db.cart.find((item) => item.userId === userId && item.goodId === goodId);
    if (existing) existing.count += Number(body.count || 1);
    else db.cart.push({ id: nextId(db.cart), userId, goodId, count: Number(body.count || 1), selected: true });
    writeDb(db);
    return send(res, 201, { ok: true });
  }

  const cartMatch = pathname.match(/^\/api\/cart\/(\d+)$/);
  if (cartMatch) {
    const id = Number(cartMatch[1]);
    const item = db.cart.find((entry) => entry.id === id);
    if (!item) return send(res, 404, { message: '购物车商品不存在' });
    if (req.method === 'PUT') {
      const body = await readBody(req);
      if (body.count !== undefined) item.count = Math.max(1, Number(body.count));
      if (body.selected !== undefined) item.selected = Boolean(body.selected);
      writeDb(db);
      return send(res, 200, item);
    }
    if (req.method === 'DELETE') {
      db.cart = db.cart.filter((entry) => entry.id !== id);
      writeDb(db);
      return send(res, 200, { ok: true });
    }
  }

  if (req.method === 'DELETE' && pathname === '/api/cart/selected') {
    const userId = Number(url.searchParams.get('userId'));
    db.cart = db.cart.filter((item) => item.userId !== userId || !item.selected);
    writeDb(db);
    return send(res, 200, { ok: true });
  }

  if (req.method === 'GET' && pathname === '/api/addresses') {
    const userId = Number(url.searchParams.get('userId'));
    return send(res, 200, db.addresses.filter((item) => item.userId === userId));
  }

  if (req.method === 'POST' && pathname === '/api/addresses') {
    const body = await readBody(req);
    const userId = Number(body.userId);
    const isDefault = db.addresses.filter((item) => item.userId === userId).length === 0 || Boolean(body.isDefault);
    if (isDefault) db.addresses.forEach((item) => { if (item.userId === userId) item.isDefault = false; });
    const address = {
      id: nextId(db.addresses),
      userId,
      name: body.name,
      phone: body.phone,
      province: body.province || '',
      city: body.city || '',
      detail: body.detail,
      isDefault
    };
    db.addresses.push(address);
    writeDb(db);
    return send(res, 201, address);
  }

  const addressMatch = pathname.match(/^\/api\/addresses\/(\d+)$/);
  if (addressMatch) {
    const id = Number(addressMatch[1]);
    const index = db.addresses.findIndex((item) => item.id === id);
    if (index === -1) return send(res, 404, { message: '地址不存在' });
    if (req.method === 'PUT') {
      const body = await readBody(req);
      const next = { ...db.addresses[index], ...body, id, userId: db.addresses[index].userId };
      if (next.isDefault) db.addresses.forEach((item) => { if (item.userId === next.userId) item.isDefault = false; });
      db.addresses[index] = next;
      writeDb(db);
      return send(res, 200, next);
    }
    if (req.method === 'DELETE') {
      const [deleted] = db.addresses.splice(index, 1);
      const rest = db.addresses.filter((item) => item.userId === deleted.userId);
      if (deleted.isDefault && rest.length) rest[0].isDefault = true;
      writeDb(db);
      return send(res, 200, deleted);
    }
  }

  const defaultAddressMatch = pathname.match(/^\/api\/addresses\/(\d+)\/default$/);
  if (req.method === 'PATCH' && defaultAddressMatch) {
    const id = Number(defaultAddressMatch[1]);
    const address = db.addresses.find((item) => item.id === id);
    if (!address) return send(res, 404, { message: '地址不存在' });
    db.addresses.forEach((item) => { if (item.userId === address.userId) item.isDefault = false; });
    address.isDefault = true;
    writeDb(db);
    return send(res, 200, address);
  }

  if (req.method === 'GET' && pathname === '/api/favorites') {
    const userId = Number(url.searchParams.get('userId'));
    const goodId = url.searchParams.get('goodId');
    const list = db.favorites
      .filter((item) => item.userId === userId && (!goodId || item.goodId === Number(goodId)))
      .map((item) => ({ ...item, good: db.goods.find((good) => good.id === item.goodId) }))
      .filter((item) => item.good);
    return send(res, 200, list);
  }

  if (req.method === 'POST' && pathname === '/api/favorites') {
    const body = await readBody(req);
    const existing = db.favorites.find((item) => item.userId === Number(body.userId) && item.goodId === Number(body.goodId));
    if (existing) return send(res, 200, existing);
    const favorite = { id: nextId(db.favorites), userId: Number(body.userId), goodId: Number(body.goodId), createTime: new Date().toLocaleString() };
    db.favorites.push(favorite);
    writeDb(db);
    return send(res, 201, favorite);
  }

  const favoriteMatch = pathname.match(/^\/api\/favorites\/(\d+)$/);
  if (req.method === 'DELETE' && favoriteMatch) {
    const id = Number(favoriteMatch[1]);
    db.favorites = db.favorites.filter((item) => item.id !== id);
    writeDb(db);
    return send(res, 200, { ok: true });
  }

  if (req.method === 'GET' && pathname === '/api/reviews') {
    const goodId = Number(url.searchParams.get('goodId'));
    const list = db.reviews.filter((item) => item.goodId === goodId);
    return send(res, 200, list);
  }

  if (req.method === 'POST' && pathname === '/api/reviews') {
    const body = await readBody(req);
    const user = db.users.find((item) => item.id === Number(body.userId));
    const review = {
      id: nextId(db.reviews),
      userId: Number(body.userId),
      goodId: Number(body.goodId),
      nickname: user?.nickname || '匿名用户',
      rating: Number(body.rating || 5),
      content: body.content,
      createTime: new Date().toLocaleString()
    };
    db.reviews.unshift(review);
    writeDb(db);
    return send(res, 201, review);
  }

  if (req.method === 'POST' && pathname === '/api/orders') {
    const body = await readBody(req);
    const items = body.items.map((item) => ({ goodId: Number(item.goodId), count: Number(item.count || 1), price: Number(item.price), name: item.name, img: item.img }));
    const address = body.addressId ? db.addresses.find((item) => item.id === Number(body.addressId)) : null;
    const order = {
      id: nextId(db.orders),
      userId: Number(body.userId),
      orderNo: String(Date.now()),
      items,
      price: items.reduce((sum, item) => sum + item.price * item.count, 0),
      addressId: address?.id || null,
      address: address ? compactAddress(address) : (body.address || '北京市海淀区北京交通大学'),
      receiver: address ? { name: address.name, phone: address.phone } : null,
      status: 'unpaid',
      createTime: new Date().toLocaleString(),
      payTime: '',
      shipTime: '',
      logistics: '待支付，暂无物流信息',
      logisticsCompany: '',
      trackingNo: '',
      logisticsTraces: [{ time: new Date().toLocaleString(), text: '订单已创建' }]
    };
    db.orders.unshift(order);
    writeDb(db);
    return send(res, 201, order);
  }

  if (req.method === 'GET' && pathname === '/api/orders') {
    const userId = url.searchParams.get('userId');
    const orders = userId ? db.orders.filter((item) => item.userId === Number(userId)) : db.orders;
    return send(res, 200, orders.map(withStatusText));
  }

  const orderMatch = pathname.match(/^\/api\/orders\/(\d+)$/);
  if (req.method === 'GET' && orderMatch) {
    const order = db.orders.find((item) => item.id === Number(orderMatch[1]));
    return order ? send(res, 200, withStatusText(order)) : send(res, 404, { message: '订单不存在' });
  }

  const logisticsMatch = pathname.match(/^\/api\/orders\/(\d+)\/logistics$/);
  if (req.method === 'GET' && logisticsMatch) {
    const order = db.orders.find((item) => item.id === Number(logisticsMatch[1]));
    if (!order) return send(res, 404, { message: '订单不存在' });
    return send(res, 200, {
      orderId: order.id,
      status: order.status,
      statusText: orderStatusText(order.status),
      company: order.logisticsCompany || '校园优选快递',
      trackingNo: order.trackingNo || '',
      traces: order.logisticsTraces || []
    });
  }

  const orderActionMatch = pathname.match(/^\/api\/orders\/(\d+)\/(pay|ship|receive|close)$/);
  if (req.method === 'PATCH' && orderActionMatch) {
    const order = db.orders.find((item) => item.id === Number(orderActionMatch[1]));
    if (!order) return send(res, 404, { message: '订单不存在' });
    const body = await readBody(req);
    const action = orderActionMatch[2];
    order.logisticsTraces = order.logisticsTraces || [];
    if (action === 'pay') {
      order.status = 'paid';
      order.payTime = new Date().toLocaleString();
      order.logistics = '商家正在准备发货';
      order.logisticsTraces.push({ time: order.payTime, text: '订单已支付，等待商家发货' });
    }
    if (action === 'ship') {
      order.status = 'shipped';
      order.shipTime = new Date().toLocaleString();
      order.logisticsCompany = body.company || '校园优选快递';
      order.trackingNo = body.trackingNo || ('YT' + Date.now());
      order.logistics = '包裹已从仓库发出';
      order.logisticsTraces.push({ time: order.shipTime, text: '商家已发货，包裹已从仓库发出' });
      order.logisticsTraces.push({ time: new Date(Date.now() + 1000).toLocaleString(), text: '快件正在运输途中' });
    }
    if (action === 'receive') {
      order.status = 'received';
      order.logistics = '用户已确认收货';
      order.logisticsTraces.push({ time: new Date().toLocaleString(), text: '用户已确认收货' });
    }
    if (action === 'close') {
      order.status = 'closed';
      order.logistics = '订单已关闭';
      order.logisticsTraces.push({ time: new Date().toLocaleString(), text: '订单已关闭' });
    }
    writeDb(db);
    return send(res, 200, withStatusText(order));
  }

  return send(res, 404, { message: '接口不存在' });
}

http.createServer(handler).listen(PORT, '127.0.0.1', () => {
  console.log(`Mock API running at http://127.0.0.1:${PORT}`);
});
