# SView 域名配置完整指南

> **域名**: sviewapp.com → GitHub Pages (5trongwang.github.io/sview-legal)
> **邮箱**: support@sviewapp.com → Zoho Mail 免费版
> **更新时间**: 2026-03-19

---

## 第一步：DNS 记录配置（在域名注册商后台操作）

### 1.1 GitHub Pages — A 记录（将根域名指向 GitHub）

在你的域名注册商（如 Namecheap / GoDaddy / Cloudflare）中，添加以下 **4 条 A 记录**：

| 类型 | 主机名 | 值（IP 地址）       | TTL  |
|------|--------|---------------------|------|
| A    | @      | 185.199.108.153     | 3600 |
| A    | @      | 185.199.109.153     | 3600 |
| A    | @      | 185.199.110.153     | 3600 |
| A    | @      | 185.199.111.153     | 3600 |

### 1.2 GitHub Pages — CNAME 记录（www 子域名重定向）

| 类型  | 主机名 | 值                              | TTL  |
|-------|--------|---------------------------------|------|
| CNAME | www    | 5trongwang.github.io            | 3600 |

> ⚠️ 注意：`@` 表示根域名（sviewapp.com 本身）；部分注册商写作留空或 `sviewapp.com.`

---

### 1.3 Zoho Mail — 邮件相关记录

#### MX 记录（邮件接收）

| 类型 | 主机名 | 值                    | 优先级 | TTL  |
|------|--------|-----------------------|--------|------|
| MX   | @      | mx.zoho.com           | 10     | 3600 |
| MX   | @      | mx2.zoho.com          | 20     | 3600 |
| MX   | @      | mx3.zoho.com          | 50     | 3600 |

#### SPF 记录（防止邮件被伪造）

| 类型 | 主机名 | 值                                                |
|------|--------|---------------------------------------------------|
| TXT  | @      | `v=spf1 include:zoho.com ~all`                    |

#### DKIM 记录（邮件签名验证）

> ⚠️ DKIM 的值需要在 Zoho Mail 后台 → **邮件管理 → 域名** → **DKIM** 中生成，不能手动填写。

步骤：
1. 登录 [Zoho Mail Admin](https://mailadmin.zoho.com)
2. 进入 **Domains** → 选择 sviewapp.com → **DKIM**
3. 点击 **Generate** 获取 DKIM 公钥
4. 将以下格式的 TXT 记录添加到 DNS：

| 类型 | 主机名                    | 值（由 Zoho 提供）              |
|------|---------------------------|---------------------------------|
| TXT  | `zoho._domainkey`         | `v=DKIM1; k=rsa; p=MIGfMA0G...` |

#### DMARC 记录（邮件策略声明）

| 类型 | 主机名         | 值                                                                    |
|------|----------------|-----------------------------------------------------------------------|
| TXT  | `_dmarc`       | `v=DMARC1; p=none; rua=mailto:support@sviewapp.com; fo=1`              |

> 说明：`p=none` 为监控模式，不会拦截邮件，适合初期配置。稳定后可改为 `p=quarantine` 或 `p=reject`。

---

## 第二步：GitHub 仓库操作

将以下文件推送到 `sview-legal` 仓库：

```bash
# 进入你的仓库目录
cd ~/path/to/sview-legal

# 验证 CNAME 文件（内容应为 sviewapp.com，无换行无空格）
cat CNAME

# 创建 .nojekyll（已创建，确认存在）
ls -la .nojekyll

# 创建 .well-known 目录（已创建）
ls -la .well-known/apple-app-site-association

# 提交并推送所有变更
git add CNAME .nojekyll .well-known/ privacy.html
git commit -m "feat: add custom domain, AASA, and update contact email"
git push origin main
```

推送完成后，在 GitHub 仓库设置中：
1. 进入 **Settings → Pages**
2. 在 **Custom domain** 填写 `sviewapp.com`
3. 勾选 **Enforce HTTPS**（需等待 DNS 生效后才能勾选，约 24 小时）

---

## 第三步：apple-app-site-association 文件配置

文件位于 `.well-known/apple-app-site-association`，**必须**更新其中的占位符：

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.yourcompany.sview",
        "paths": ["/open/*", "/share/*", "/view/*"]
      }
    ]
  }
}
```

**如何获取 TEAMID**：
1. 登录 [Apple Developer](https://developer.apple.com/account)
2. 进入 **Membership** → 复制 **Team ID**（10位字母数字，如 `AB12CD34EF`）

**如何获取 Bundle ID**：
- 在 Xcode 中：**Project → Target → General → Bundle Identifier**（如 `com.strongwang.sview`）

最终 appID 格式：`AB12CD34EF.com.strongwang.sview`

---

## 第四步：Xcode 中启用 Universal Links

1. 在 Xcode 中选中你的 Target
2. 进入 **Signing & Capabilities**
3. 点击 **+ Capability** → 添加 **Associated Domains**
4. 在 domains 列表中添加：`applinks:sviewapp.com`
5. 重新打包并上传 TestFlight 验证

---

## 第五步：部署后验证清单

### 5.1 DNS 全球扩散检查

```bash
# 检查 A 记录是否指向 GitHub Pages IP
dig sviewapp.com A +short

# 检查 www CNAME
dig www.sviewapp.com CNAME +short

# 检查 MX 记录
dig sviewapp.com MX +short

# 检查 SPF 记录
dig sviewapp.com TXT +short
```

或使用在线工具：https://dnschecker.org/#A/sviewapp.com

---

### 5.2 HTTPS 强制跳转验证

```bash
# 验证 HTTP → HTTPS 自动跳转（应返回 301）
curl -I http://sviewapp.com

# 验证 HTTPS 正常响应（应返回 200）
curl -I https://sviewapp.com

# 验证 SSL 证书信息
echo | openssl s_client -connect sviewapp.com:443 2>/dev/null | openssl x509 -noout -dates -subject
```

---

### 5.3 AASA 文件可访问性验证

Apple 爬虫要求 AASA 文件：
- 通过 HTTPS 访问
- Content-Type 为 `application/json`
- **不能**有重定向

```bash
# 验证 AASA 文件可访问，且返回正确的 Content-Type
curl -v https://sviewapp.com/.well-known/apple-app-site-association

# 使用 Apple 官方验证工具（需要 App 上架后）
# https://search.developer.apple.com/appsearch-validation-tool/
```

在线验证工具：https://branch.io/resources/aasa-validator/

---

### 5.4 邮件配置验证

```bash
# 验证 SPF
dig sviewapp.com TXT +short | grep spf

# 验证 DMARC
dig _dmarc.sviewapp.com TXT +short

# 验证 DKIM
dig zoho._domainkey.sviewapp.com TXT +short
```

发送测试邮件到 [mail-tester.com](https://www.mail-tester.com) 验证邮件评分（满分 10 分）。

---

## 配置时间线参考

| 步骤 | 预计生效时间 |
|------|-------------|
| DNS A/CNAME 记录 | 1–24 小时 |
| GitHub Pages HTTPS 证书 | DNS 生效后 10 分钟内 |
| MX / SPF / DMARC 记录 | 1–24 小时 |
| DKIM 记录 | 1–24 小时 |
| Apple AASA 爬虫首次抓取 | App 安装时触发，或上架后 |

---

*生成时间：2026-03-19 | 适用于 SView iOS App*
