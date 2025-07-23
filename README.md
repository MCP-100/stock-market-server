# Stock Market MCP Server

一个基于 TypeScript 的 MCP 服务器，用于获取股票市场数据。该服务器通过 Alpha Vantage API 提供实时股票市场信息和公司财务数据。

<a href="https://glama.ai/mcp/servers/@MCP-100/stock-market-server">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@MCP-100/stock-market-server/badge" alt="Stock Market Server MCP server" />
</a>

## 生成该 MCPServer 的关键信息
- [.clinerules](https://docs.cline.bot/mcp-servers/mcp-server-from-scratch)
- [api-key](https://www.alphavantage.co/support/#api-key)


```md
1.Plan mode

help me build a stock market mcp server that uses the AlphaVantage public API
I want it to have these tools：
- generate US market report/briefing
- generate financial statement for company
- get ticker price for company
- any other basic tools you think would be helpful
- api key: <you api key>


2. please test all the tools to confirm their functionality
```

## 功能特点

### 工具
- `get_ticker_price` - 获取股票实时价格
  - 需要提供股票代码作为参数
  - 返回最新的股票价格和时间戳

- `get_market_report` - 获取美国市场报告
  - 提供市场整体状况概览

- `get_financial_statement` - 获取公司财务报表
  - 支持三种报表类型：收入报表(income)、资产负债表(balance)、现金流量表(cashflow)
  - 需要提供股票代码和报表类型

- `get_company_overview` - 获取公司概览信息
  - 需要提供股票代码
  - 返回公司关键指标和基本信息

## 开发环境配置

### 安装依赖
```bash
npm install
```

### 构建项目
```bash
npm run build
```

### 开发模式（自动重新构建）
```bash
npm run watch
```

## 安装说明

要在 Claude Desktop 中使用此服务器，需要添加服务器配置：

### MacOS
配置文件路径：`~/Library/Application Support/Claude/claude_desktop_config.json`

### Windows
配置文件路径：`%APPDATA%/Claude/claude_desktop_config.json`

配置示例：
```json
{
  "mcpServers": {
    "stock-market-server": {
      "command": "/path/to/stock-market-server/build/index.js"
    }
  }
}
```

## 调试

由于 MCP 服务器通过标准输入输出(stdio)通信，调试可能比较困难。推荐使用 MCP Inspector 工具进行调试：

```bash
npm run inspector
```

运行后，Inspector 将提供一个浏览器访问地址，可以通过浏览器使用调试工具。

## 技术栈

- TypeScript
- Node.js
- Alpha Vantage API
- MCP SDK (@modelcontextprotocol/sdk)

## 注意事项

- 使用前需要确保有有效的 Alpha Vantage API 密钥
- 所有 API 响应都以 JSON 格式返回
- 请注意 Alpha Vantage API 的调用频率限制

## 许可证

[添加许可证信息]