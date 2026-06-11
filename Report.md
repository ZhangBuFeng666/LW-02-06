# 第四次作业报告

**姓名：** 组长姓名  
**学号：** 20260001  
**作业名称：** React 商城系统

---

## 1. 组员分工

| 姓名 | 学号 | 分工与产出 | 贡献占比 |
|------|------|-----------|---------|
| 组长姓名（组长） | 20260001 | 项目架构、Mock 后端、接口设计、ServiceContext、路由、主链路联调、最终自检打包 |
| 组员A | 20260002 | 首页、分类页、商品详情页，完成搜索、轮播推荐、热门商品和商品浏览体验 |
| 组员B | 20260003 | 用户登录/注册、购物车、创建订单、支付、订单列表、订单详情、我的页面 | 
| 组员C | 20260004 | 后台登录、角色权限、商品管理增删改查、上下架、订单查看发货和前后台联动演示 | 
| 组员D | 20260005 | 功能测试、Bug 记录、Report、PPT、答辩脚本和演示流程控制 |

---

## 2. 项目结构

```
server/
├── index.cjs           ← Mock 后端 API
└── db.json             ← Mock 数据

src/
├── services/           ← 前端统一接口调用层
├── contexts/           ← ServiceContext
├── pages/              ← 前台与后台页面
├── router.jsx          ← 前后台路由
└── App.jsx             ← 根组件与导航
```

| 页面/组件 | 职责 |
|-----------|------|
| App | 提供全局导航、用户状态展示和子路由出口 |
| HomePage | 展示搜索框、轮播推荐和热门商品 |
| CategoryPage | 按分类展示所有上架商品 |
| LoginPage | 完成前台用户登录和注册 |
| DetailPage | 展示商品详情，支持加入购物车、立即购买、收藏和评价 |
| CartPage | 展示购物车，支持数量修改、删除和选中结算 |
| CreateOrderPage | 确认地址与商品清单并生成订单 |
| PayPage | 模拟二维码支付和倒计时 |
| OrderListPage | 展示当前用户订单列表 |
| OrderDetailPage | 展示订单状态、商品信息和物流信息 |
| MinePage | 展示用户信息、订单、地址、收藏和后台入口 |
| AdminLoginPage | 后台用户登录 |
| AdminGoodsPage | 后台商品统计、搜索筛选、增删改查、上下架和权限控制 |
| AdminOrdersPage | 后台订单统计、搜索筛选、订单查看与发货 |
| AddressPage | 收货地址新增、编辑、删除、默认地址设置 |
| FavoritePage | 用户收藏商品列表 |

## 3. 前台功能实现说明

| 功能模块 | 实现方式 |
|----------|----------|
| 商城主页面（搜索框/轮播图/热门商品） | 首页通过 goodService 调用 /api/goods，支持关键词搜索，展示轮播推荐和热门商品 |
| 分类页 | 通过 /api/categories 和 /api/goods?categoryId= 分类筛选商品 |
| 商品详情页 | 根据路由参数请求 /api/goods/:id，展示图片、价格、库存、描述 |
| 购物车 | cartService 调用 /api/cart，支持加入、数量修改、删除、勾选结算 |
| 创建订单 | 支持详情页单商品下单，也支持购物车选中商品批量下单 |
| 支付页面 | 调用 /api/orders/:id/pay 更新订单状态，并展示模拟二维码和倒计时 |
| 订单列表 | 根据当前登录用户请求 /api/orders?userId= |
| 订单详情 | 展示订单状态、商品清单、收货地址、物流公司、运单号和物流轨迹，可确认收货 |
| 用户登录/注册 | userService 调用 /api/login 和 /api/register，当前用户保存到 localStorage |

## 4. 后台管理端功能实现说明

| 功能模块 | 实现方式 |
|----------|----------|
| 后台登录 | /admin/login 使用独立 AdminLoginPage，adminService 调用 /api/admin/login，默认账号 admin / 123456、operator / 123456 |
| 权限管理 | 后台路由有登录守卫；admin 可管理商品和订单发货，operator 只能查看商品和订单 |
| 商品管理 | 支持统计卡片、商品搜索、分类筛选、上下架筛选、商品新增、编辑、删除、上下架，数据写入 server/db.json 并与前台接口联动 |
| 订单管理 | 支持统计卡片、订单号搜索、状态筛选；对待发货订单填写快递公司和物流单号后发货，订单详情同步展示物流信息 |

## 5. 路由设计

```jsx
const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: HomePage },
      { path: 'category', Component: CategoryPage },
      { path: 'cart', Component: CartPage },
      { path: 'mine', Component: MinePage },
      { path: 'login', Component: LoginPage },
      { path: 'detail/:goodId', Component: DetailPage },
      { path: 'createOrder/:goodId?', Component: CreateOrderPage },
      { path: 'pay/:orderId', Component: PayPage },
      { path: 'orderList', Component: OrderListPage },
      { path: 'orderDetail/:orderId', Component: OrderDetailPage },
      { path: 'admin/login', Component: AdminLoginPage },
      { path: 'admin/goods', Component: AdminGoodsPage },
      { path: 'admin/orders', Component: AdminOrdersPage },
    ],
  },
]);
```

## 6. 状态管理与数据存储

- **全局状态管理方式：** React Hooks + ServiceContext。
- **数据存储方式：** Mock 后端使用 server/db.json 保存商品、购物车和订单数据；前端 localStorage 仅保存当前登录用户和后台用户。
- **前后台数据联动方式：** 前台和后台都通过 service 层请求同一个 Mock API。后台修改商品后，Mock 数据更新，前台重新请求商品列表即可看到变化。

## 7. 加分项完成情况

- [x] **后端联动**：使用 Node.js Mock API 提供商品、购物车、订单、地址、物流、收藏、评价、用户和后台管理接口。
- [x] **数据持久化**：Mock 数据保存在 server/db.json，登录状态保存在 localStorage。
- [x] **表单验证**：登录、注册、新增商品使用 required、minLength 等基础校验。
- [ ] **分页/无限滚动**：本版本商品数量较少，未实现分页。
- [x] **支付模拟优化**：支付页包含二维码式支付区和倒计时。
- [x] **响应式布局**：使用 CSS Grid 和媒体查询适配移动端。
- [ ] **性能优化**：本版本功能规模较小，未单独加入 React.memo 等优化。
- [ ] **单元测试**：未编写单元测试，使用构建和功能自测保证运行。
- [ ] **部署上线**：本次提交 zip 文件，不包含线上部署链接。

## 8. 遇到的问题与解决方案

| 问题 | 解决方案 |
|------|----------|
| 作业要求前后台联动但不强制真实数据库 | 使用 Node.js 搭建 Mock API，数据保存到 server/db.json |
| 多个页面共享商品、购物车、订单数据 | 使用 services 目录统一封装接口，页面不直接操作数据源 |
| 后台角色权限需要体现 | 设置 admin 和 operator 两个后台账号，admin 可管理商品和发货，operator 只读；后台页顶部展示当前账号、角色和权限 |
| 接力开发容易改乱接口 | 编写开发说明，约定 API 路径、字段、service 函数名和各成员负责文件 |


## 9. Mock 后端接口补充

- 收货地址接口：支持地址列表、新增、编辑、删除和设置默认地址。
- 物流接口：订单详情可查看物流公司、运单号和轨迹。
- 后台订单接口：后台可查看订单并对待发货订单执行发货。
- 收藏接口：用户可收藏商品，并在我的收藏中查看。
- 评价接口：商品详情页展示评价，登录用户可发布评价。
