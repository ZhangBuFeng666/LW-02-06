# 组员B 任务完成报告

**姓名：** 薛探昕
**分工：** 前台交易模块
**负责页面：** 登录/注册、购物车、创建订单、支付、订单列表、订单详情、我的页面、地址管理、收藏管理

---

## 一、任务总览

| 用户故事 | 对应页面 | 完成状态 |
|----------|---------|---------|
| 能注册账号并登录商城 | LoginPage | ✅ |
| 能把喜欢的商品加入购物车，并修改数量、删除或结算 | CartPage | ✅ |
| 创建订单时能选择收货地址 | CreateOrderPage + AddressPage | ✅ |
| 提交订单后能进入支付页并看到订单金额 | PayPage | ✅ |
| 在订单详情中查看商品、地址、物流状态和物流轨迹 | OrderDetailPage | ✅ |
| 能收藏商品并在收藏夹中查看 | FavoritePage | ✅ |
| 我的页面查看订单状态、快速入口 | MinePage | ✅ |
| 订单列表按状态筛选 | OrderListPage | ✅ |
| 订单内新建地址 | CreateOrderPage | ✅ |
| 支付倒计时、支付成功跳转 | PayPage | ✅ |

---

## 二、修改文件清单

### 2.1 新增 CSS 动效系统

**文件：** `src/App.css`

新增约 300 行 CSS 代码，建立统一的动效和组件样式系统：

| 样式类名 | 作用 |
|----------|------|
| `.animate-fade-rise` | 页面/区块进入时从下方渐显上浮（500ms） |
| `.animate-stagger` | 子元素依次出现，交错 60ms 营造节奏感 |
| `.img-hover-zoom` | 图片悬停时微微放大（scale 1.03） |
| `.button:active` | 按钮点击时缩放反馈（scale 0.97） |
| `.status-badge` | 订单状态彩色徽章（unpaid/paid/shipped/received/closed） |
| `.pay-qr-wrapper` | 精致渐变边框 QR 码容器 |
| `.pay-countdown` | 倒计时样式，`.urgent` 变红脉动 |
| `.pay-success-overlay` | 支付成功全屏弹窗动画 |
| `.timeline-enhanced` | 物流时间轴（左侧竖线 + 节点圆点） |
| `.address-cards` / `.address-card` | 卡片式地址选择器（替代 select 下拉框） |
| `.qty-control` | 数量 +/- 控制器 |
| `.order-row-enhanced` | 订单列表增强卡片（hover 上浮 + 阴影） |
| `.order-tabs` / `.order-tab` | 订单状态筛选标签栏 |
| `.mine-header` | 我的页面渐变头部 |
| `.mine-stats` | 订单统计数字网格 |
| `.mine-order-tabs` | 订单状态快捷入口（带角标） |
| `.mine-quick-links` | 快捷功能入口网格 |

### 2.2 逐页面修改

#### LoginPage.jsx — 登录/注册页

**修改内容：**
- 添加 `.animate-fade-rise` 进入动效
- 标题使用楷体字体 `STKaiti`
- 注册模式增加昵称空值验证
- 添加 `loading` 状态防止重复提交
- 按钮禁用时显示"处理中..."

#### CartPage.jsx — 购物车

**修改内容：**
- 数量输入框改为 `qty-control` +/- 按钮控制器（禁用负数）
- 删除操作添加 `window.confirm` 确认提示
- 空购物车状态：显示 🛒 emoji + "去逛逛" 引导按钮
- 购物车列表添加 `animate-stagger` 交错动效
- 图片添加 `img-hover-zoom` 悬停放大
- 价格使用 `.price` 高亮显示

#### CreateOrderPage.jsx — 创建订单

**修改内容：**
- 地址选择从 `<select>` 下拉框改为 `.address-cards` 卡片选择器（带 radio 圆点和"默认"标签）
- **新增：订单内新建地址**（展开表单，保存后自动选中新地址）
- 商品清单添加 `animate-stagger` 交错动效
- 结算栏价格使用 `.price` 高亮
- 提交按钮添加 `submitting` loading 状态

#### PayPage.jsx — 支付页面

**修改内容：**
- QR 码从简陋的 `.fake-qr` 改为 `.pay-qr-wrapper` 渐变边框容器
- 倒计时从 30 秒改为 **300 秒（5 分钟）**
- 最后 60 秒触发 `.urgent` 样式 — 变红 + 脉动动画
- 已支付订单自动跳转订单详情（防止重复进入支付页）
- 支付按钮添加 `paying` loading 状态
- 超时后按钮禁用显示"已超时"
- **支付成功后显示全屏弹窗动画，1.8 秒后跳转订单列表**

#### OrderListPage.jsx — 订单列表

**修改内容：**
- **新增状态筛选标签栏**（全部/待付款/待发货/待收货/已完成）
- 支持 URL 参数 `?status=unpaid` 直接定位（从"我的"页面跳转）
- 每个标签显示对应状态订单数量
- 订单卡片展示商品缩略图（最多 3 张 + 数量溢出提示）
- 空筛选结果显示"该状态下暂无订单"
- 空订单显示 📦 emoji + "去逛逛" 引导

#### OrderDetailPage.jsx — 订单详情

**修改内容：**
- 订单状态使用 `.status-badge` 彩色徽章显示
- 信息网格关键字段加粗（订单号、创建时间等）
- 物流信息合并显示（物流公司 + 运单号）
- 物流轨迹从普通列表改为 `.timeline-enhanced` 时间轴（竖线 + 节点圆点，首节点高亮）
- 确认收货添加 `window.confirm` 二次确认
- 无物流信息时显示"暂无物流信息"提示

#### MinePage.jsx — 我的页面（重构）

**修改内容（整体重写）：**
- **个人信息头部**：渐变背景（primary 色），头像 + 昵称 + 用户名 + 退出登录按钮
- **订单统计栏**：4 列网格显示（全部/待付款/待发货/待收货），点击跳转对应筛选
- **订单状态快捷入口**：5 个图标入口（全部订单/待付款/待发货/待收货/已完成），带角标数字
- **快捷功能**：购物车、我的收藏、收货地址 3 个入口卡片
- **最近订单**：显示最近 3 笔订单（订单号 + 状态徽章 + 商品缩略图 + 金额）
- 未登录状态显示 👤 emoji + 引导登录

#### AddressPage.jsx — 地址管理

**修改内容：**
- 删除操作添加 `window.confirm` 确认提示
- 编辑模式显示"取消"按钮
- 已是默认地址时隐藏"设为默认"按钮
- 添加 `.animate-fade-rise` 进入动效
- 地址列表添加 `.animate-stagger` 交错动效
- 空地址状态提示"暂无收货地址，请添加"

#### FavoritePage.jsx — 收藏管理

**修改内容：**
- 空收藏状态：显示 ❤️ emoji + "去逛逛" 引导按钮
- 取消收藏添加 `window.confirm` 确认提示
- 添加 `.animate-fade-rise` 进入动效
- 商品网格添加 `.animate-stagger` 交错动效

---

## 三、交互流程设计

### 3.1 完整购买流程

```
商品详情 → [加入购物车] → 购物车(选择商品/修改数量) → [去结算]
→ 创建订单(选择/新建地址) → [提交订单] → 支付(倒计时5分钟)
→ [确认已支付] → 支付成功弹窗 → 订单列表(自动刷新)
```

### 3.2 立即购买流程

```
商品详情 → [立即购买] → 创建订单(选择地址) → [提交订单]
→ 支付 → 成功 → 订单列表
```

### 3.3 订单状态流转

```
unpaid(待付款) → paid(待发货) → shipped(待收货) → received(已完成)
                ↘ closed(已关闭，超时未支付)
```

---

## 四、设计规范遵循

所有页面均遵循 frontend-skill 设计规范：

| 规范项 | 实现方式 |
|--------|---------|
| 字体 | 标题使用 `STKaiti` 楷体，正文使用 `Songti SC` 宋体，数字使用 `Palatino Linotype` |
| 色彩 | 基于 MD3 色彩系统，单种子色 `hsl(175, 35%, 55%)`，遵循 60-30-10 法则 |
| 动效 | 统一 fade-rise 进入动效 + stagger 交错动效，按钮 active 缩放反馈 |
| 留白 | 充足的 padding 和 margin，呼吸感布局 |
| 无卡片化 | 使用 section/divider/media-block 替代通用卡片 |
| 响应式 | 860px 和 480px 两个断点适配移动端 |

---

## 五、CSS 变量使用

所有颜色均使用 CSS 变量，不使用硬编码 hex 值：

```css
--surface          /* 背景底色 */
--surface-container /* 容器背景 */
--primary          /* 主色调 */
--primary-hover    /* 主色悬停 */
--tertiary         /* 点缀色 */
--on-surface       /* 正文文字 */
--on-surface-variant /* 次要文字 */
--outline          /* 边框线 */
--danger           /* 危险/删除 */
```

---

## 六、编译验证

```
✓ vite build 编译通过
✓ 52 个模块成功转换
✓ CSS 产物：20.20 KB (gzip: 4.83 KB)
✓ JS 产物：356.34 KB (gzip: 111.06 KB)
```

---

## 七、文件修改统计

| 文件 | 操作类型 | 改动说明 |
|------|---------|---------|
| `src/App.css` | 修改 | 新增约 300 行 CSS（动效系统 + 组件样式） |
| `src/pages/LoginPage.jsx` | 修改 | 动效、验证、loading 状态 |
| `src/pages/CartPage.jsx` | 重写 | +/- 控制器、删除确认、空状态引导 |
| `src/pages/CreateOrderPage.jsx` | 重写 | 地址卡片选择器、订单内新建地址 |
| `src/pages/PayPage.jsx` | 重写 | 渐变 QR 码、5 分钟倒计时、支付成功弹窗 |
| `src/pages/OrderListPage.jsx` | 重写 | 状态标签筛选、URL 参数支持 |
| `src/pages/OrderDetailPage.jsx` | 重写 | 状态徽章、时间轴增强、确认收货二次确认 |
| `src/pages/MinePage.jsx` | 重写 | 个人信息头部、订单统计、快捷入口、最近订单 |
| `src/pages/AddressPage.jsx` | 重写 | 删除确认、编辑取消、动效 |
| `src/pages/FavoritePage.jsx` | 重写 | 空状态引导、取消确认、动效 |

**共计修改 10 个文件，其中 1 个 CSS 文件 + 9 个页面组件。**
