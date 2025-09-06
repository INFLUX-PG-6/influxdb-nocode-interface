-- ============================================
-- 0) 初始化扩展（提供 UUID 和密码学函数）
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";         -- 如果未安装则启用 uuid-ossp 扩展，用于生成 UUID（如会话ID）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";          -- 启用 pgcrypto 扩展，提供 crypt()/gen_salt() 等加密函数

-- ============================================
-- 1) 公共认证与用户管理（前端依赖 url/org/token/permissions）
-- ============================================

DROP TABLE IF EXISTS customers CASCADE;             -- 若已存在 customers 表则删除；CASCADE 表示连同依赖对象一并删除
CREATE TABLE customers (                            -- 创建客户（租户）表：多租户/多行业隔离的根信息
    id SERIAL PRIMARY KEY,                          -- 自增主键
    name VARCHAR(100) UNIQUE NOT NULL,              -- 客户名，唯一且必填
    industry VARCHAR(50) NOT NULL,                  -- 行业：Manufacturing/Retail/Logistics
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 创建时间，默认当前时间
);                                                  -- 结束 customers 表定义

DROP TABLE IF EXISTS users CASCADE;                 -- 若已存在 users 表则删除（及依赖）
CREATE TABLE users (                                -- 创建用户表（与前端字段对齐）
    id SERIAL PRIMARY KEY,                          -- 自增主键
    username VARCHAR(50) UNIQUE NOT NULL,           -- 登录用户名，唯一且必填
    email VARCHAR(100) UNIQUE,                      -- 邮箱，唯一（可选）
    password_hash VARCHAR(255) NOT NULL,            -- 密码哈希（bcrypt/argon2），不存明文
    url VARCHAR(255) NOT NULL,                      -- InfluxDB URL（前端 LoginForm 需要）
    org VARCHAR(100) NOT NULL,                      -- InfluxDB 组织（前端需要）
    token TEXT NOT NULL,                            -- InfluxDB API Token（前端需要；建议后端加密再入库）
    permissions JSONB DEFAULT '[]',                 -- 权限数组（JSONB），前端 Dashboard 读取
    customer_id INT REFERENCES customers(id),       -- 所属客户/租户（外键），便于多租户隔离
    status VARCHAR(20) DEFAULT 'active',            -- 账号状态：active/disabled 等
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    last_login TIMESTAMP                            -- 最近登录时间（后端登录成功后更新）
);                                                  -- 结束 users 表定义

DROP TABLE IF EXISTS sessions CASCADE;              -- 若已存在 sessions 表则删除（及依赖）
CREATE TABLE sessions (                             -- 创建会话表（支持持久会话/单点登出）
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- 主键 UUID，默认用扩展函数生成
    user_id INT REFERENCES users(id) ON DELETE CASCADE,      -- 关联用户；用户删掉则会话级联删除
    token VARCHAR(255) NOT NULL,                    -- 会话 token（JWT 或自定义随机串）
    expires_at TIMESTAMP NOT NULL,                  -- 过期时间（后端控制会话生命周期）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 创建时间
);                                                  -- 结束 sessions 表定义

CREATE INDEX idx_users_username ON users(username); -- 用户名索引：加速登录查询
CREATE INDEX idx_users_org ON users(org);           -- 组织名索引：便于按 org 过滤（例如多 org 环境）
CREATE INDEX idx_sessions_user_id ON sessions(user_id); -- 会话按用户查询的加速索引
CREATE INDEX idx_sessions_token ON sessions(token); -- 会话 token 精确匹配验证的加速索引

-- ============================================
-- 2) 行业业务数据 Schema（多租户：每客户一份数据，按 customer_id 绑定）
-- ============================================

-- ---------- 制造业 (Manufacturing) ----------
DROP SCHEMA IF EXISTS manufacturing_db CASCADE;     -- 如已存在先删（含表）
CREATE SCHEMA manufacturing_db;                     -- 创建制造业专属 schema

CREATE TABLE manufacturing_db.machine_events (      -- 机器事件明细（原始/事实事件）
    id SERIAL PRIMARY KEY,                          -- 主键
    customer_id INT REFERENCES customers(id),       -- 归属客户（外键），支持多租户隔离
    machine_id VARCHAR(50),                         -- 机器ID
    production_line VARCHAR(50),                    -- 产线
    shift VARCHAR(20),                              -- 班次（Morning/Night 等）
    event_type VARCHAR(50),                         -- 事件类型（Start/Stop/Alert 等）
    event_time TIMESTAMP NOT NULL,                  -- 事件时间（必填）
    tags JSONB,                                     -- 自定义标签（键值对，灵活）
    metrics JSONB                                   -- 指标数据（如温度/速度等），JSON 便于扩展
);                                                  -- 结束 machine_events

CREATE INDEX ON manufacturing_db.machine_events(customer_id, event_time); -- 组合索引：按租户+时间查询加速
CREATE INDEX ON manufacturing_db.machine_events(production_line);         -- 产线维度查询加速
CREATE INDEX ON manufacturing_db.machine_events(shift);                   -- 班次维度查询加速

CREATE TABLE manufacturing_db.report_templates (    -- 报表模板（保存复用）
    id SERIAL PRIMARY KEY,                          -- 主键
    customer_id INT REFERENCES customers(id),       -- 归属客户（外键）
    name VARCHAR(100),                              -- 模板名称
    query_definition JSONB,                         -- 查询定义（存 Flux/SQL/过滤参数 等）
    created_by INT REFERENCES users(id),            -- 创建人（外键到 users）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 创建时间
);                                                  -- 结束 report_templates

-- ---------- 零售业 (Retail) ----------
DROP SCHEMA IF EXISTS retail_db CASCADE;            -- 如已存在先删（含表）
CREATE SCHEMA retail_db;                            -- 创建零售业专属 schema

CREATE TABLE retail_db.sales_events (               -- 销售相关事件（销售/退货/补货）
    id SERIAL PRIMARY KEY,                          -- 主键
    customer_id INT REFERENCES customers(id),       -- 归属客户（外键）
    store_id VARCHAR(50),                           -- 门店 ID
    category VARCHAR(50),                           -- 商品品类
    product_id VARCHAR(50),                         -- 商品 ID
    event_type VARCHAR(50),                         -- 事件类型：Sale/Return/Replenishment
    quantity INT,                                   -- 数量
    amount NUMERIC(10,2),                           -- 金额（两位小数）
    event_time TIMESTAMP                            -- 事件时间
);                                                  -- 结束 sales_events

CREATE INDEX ON retail_db.sales_events(customer_id, event_time); -- 组合索引：租户+时间
CREATE INDEX ON retail_db.sales_events(store_id);                -- 按门店过滤加速
CREATE INDEX ON retail_db.sales_events(category);                -- 按品类过滤加速

CREATE TABLE retail_db.inventory_metrics (          -- 库存与健康度等派生/聚合指标
    id SERIAL PRIMARY KEY,                          -- 主键
    customer_id INT REFERENCES customers(id),       -- 归属客户（外键）
    store_id VARCHAR(50),                           -- 门店 ID
    product_id VARCHAR(50),                         -- 商品 ID
    stock_level INT,                                -- 库存数量
    turnover_days INT,                              -- 库存周转天数
    promotion_flag BOOLEAN,                         -- 是否促销
    health_score NUMERIC(5,2),                      -- 库存健康分
    recorded_at TIMESTAMP                           -- 记录时间
);                                                  -- 结束 inventory_metrics

CREATE INDEX ON retail_db.inventory_metrics(customer_id, recorded_at); -- 组合索引：租户+时间
CREATE INDEX ON retail_db.inventory_metrics(store_id);                 -- 按门店过滤
CREATE INDEX ON retail_db.inventory_metrics(product_id);               -- 按商品过滤

-- ---------- 物流业 (Logistics) ----------
DROP SCHEMA IF EXISTS logistics_db CASCADE;         -- 如已存在先删（含表）
CREATE SCHEMA logistics_db;                         -- 创建物流业专属 schema

CREATE TABLE logistics_db.fleet_events (            -- 车队事件（出车/维保/报警等）
    id SERIAL PRIMARY KEY,                          -- 主键
    customer_id INT REFERENCES customers(id),       -- 归属客户（外键）
    vehicle_id VARCHAR(50),                         -- 车辆 ID
    region VARCHAR(50),                             -- 区域
    model VARCHAR(50),                              -- 车型
    event_type VARCHAR(50),                         -- 事件类型
    event_time TIMESTAMP,                           -- 事件时间
    metrics JSONB                                   -- 指标（油量/速度/状态等）
);                                                  -- 结束 fleet_events

CREATE INDEX ON logistics_db.fleet_events(customer_id, event_time); -- 组合索引：租户+时间
CREATE INDEX ON logistics_db.fleet_events(region);                  -- 按区域过滤
CREATE INDEX ON logistics_db.fleet_events(model);                   -- 按车型过滤

CREATE TABLE logistics_db.dashboard_templates (      -- 仪表盘模板（拖拽布局/复用）
    id SERIAL PRIMARY KEY,                           -- 主键
    customer_id INT REFERENCES customers(id),        -- 归属客户（外键）
    name VARCHAR(100),                               -- 模板名称
    layout JSONB,                                    -- 布局（各图表位置/尺寸/数据源等）
    created_by INT REFERENCES users(id),             -- 创建人
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- 创建时间
);                                                   -- 结束 dashboard_templates

-- ============================================
-- 3) 示例数据（便于前后端联调/演示）
-- ============================================

-- 客户（三个行业各一条示例数据）
INSERT INTO customers (name, industry) VALUES
('Alpha Manufacturing', 'Manufacturing'),           -- 制造业客户
('Beta Retail', 'Retail'),                          -- 零售业客户
('Gamma Logistics', 'Logistics');                   -- 物流业客户

-- 用户（字段与前端需求一致：url/org/token/permissions）
INSERT INTO users (username, email, password_hash, url, org, token, permissions, customer_id)
VALUES
('admin_mfg', 'mfg@example.com',                    -- 制造业管理员（示例）
 crypt('MfgPass123', gen_salt('bf')),               -- 使用 bcrypt 生成密码哈希
 'http://localhost:8086',                           -- InfluxDB URL
 'mfg-org',                                         -- InfluxDB Org
 'MFG-TOKEN-1234567890',                            -- InfluxDB Token（演示用；实际建议加密）
 '["query:read","query:write"]'::jsonb,             -- 权限数组（JSONB）
 1),                                                -- 绑定到 Alpha Manufacturing

('admin_retail', 'retail@example.com',              -- 零售业管理员（示例）
 crypt('RetailPass123', gen_salt('bf')),            -- bcrypt 哈希
 'http://localhost:8086',
 'retail-org',
 'RETAIL-TOKEN-1234567890',
 '["query:read","visualization:create"]'::jsonb,    -- 可视化创建权限
 2),                                                -- 绑定到 Beta Retail

('admin_logistics', 'logi@example.com',             -- 物流业管理员（示例）
 crypt('LogiPass123', gen_salt('bf')),              -- bcrypt 哈希
 'http://localhost:8086',
 'logi-org',
 'LOGI-TOKEN-1234567890',
 '["query:read","dashboard:manage"]'::jsonb,        -- 仪表盘管理权限
 3);                                                -- 绑定到 Gamma Logistics

-- 会话（示例：三位管理员各创建一个 24h 会话）
INSERT INTO sessions (user_id, token, expires_at)
VALUES
(1, 'mfg-session-token', NOW() + INTERVAL '1 day'), -- 制造业会话：过期时间+1天
(2, 'retail-session-token', NOW() + INTERVAL '1 day'), -- 零售业会话
(3, 'logistics-session-token', NOW() + INTERVAL '1 day'); -- 物流业会话

-- 制造业：演示两条机器事件
INSERT INTO manufacturing_db.machine_events
(customer_id, machine_id, production_line, shift, event_type, event_time, tags, metrics)
VALUES
(1, 'M001', 'Line-A', 'Morning', 'Start', NOW(),  -- 租户=1，机器 M001 早班开机
 '{"operator":"John"}', '{"temperature":75,"speed":120}'),
(1, 'M002', 'Line-B', 'Night', 'Stop', NOW(),     -- 租户=1，机器 M002 夜班停机
 '{"operator":"Alice"}', '{"temperature":80,"speed":0}');

-- 零售业：两条销售/退货事件
INSERT INTO retail_db.sales_events
(customer_id, store_id, category, product_id, event_type, quantity, amount, event_time)
VALUES
(2, 'S001', 'Electronics', 'P1001', 'Sale',   2, 1999.99, NOW()), -- 门店 S001 售出电子产品
(2, 'S002', 'Groceries',  'P2001', 'Return',  1,    9.99,  NOW()); -- 门店 S002 发生退货

-- 零售业：库存健康度快照
INSERT INTO retail_db.inventory_metrics
(customer_id, store_id, product_id, stock_level, turnover_days, promotion_flag, health_score, recorded_at)
VALUES
(2, 'S001', 'P1001',  50, 30, FALSE, 85.5, NOW()), -- 门店 S001 商品 P1001 库存/健康
(2, 'S002', 'P2001', 200, 10, TRUE,  92.0, NOW()); -- 门店 S002 商品 P2001 库存/健康

-- 物流业：两条车队事件
INSERT INTO logistics_db.fleet_events
(customer_id, vehicle_id, region, model, event_type, event_time, metrics)
VALUES
(3, 'V001', 'East', 'Truck-A', 'StartTrip',    NOW(), '{"fuel":90,"speed":60}'), -- 东区卡车出车
(3, 'V002', 'West', 'Van-B',   'Maintenance',  NOW(), '{"fuel":50,"status":"check"}'); -- 西区面包车维保
