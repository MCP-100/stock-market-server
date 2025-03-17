#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const API_KEY = 'UM3APW59708M49EH';
const BASE_URL = 'https://www.alphavantage.co/query';

class StockMarketServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'stock-market',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      params: {
        apikey: API_KEY,
      },
    });

    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_ticker_price',
          description: 'Get current price for a stock ticker',
          inputSchema: {
            type: 'object',
            properties: {
              symbol: {
                type: 'string',
                description: 'Stock ticker symbol'
              }
            },
            required: ['symbol']
          }
        },
        {
          name: 'get_market_report',
          description: 'Generate US market report/briefing',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'get_financial_statement',
          description: 'Get financial statements for a company',
          inputSchema: {
            type: 'object',
            properties: {
              symbol: {
                type: 'string',
                description: 'Stock ticker symbol'
              },
              statement: {
                type: 'string',
                enum: ['income', 'balance', 'cashflow'],
                description: 'Type of financial statement'
              }
            },
            required: ['symbol', 'statement']
          }
        },
        {
          name: 'get_company_overview',
          description: 'Get company overview and key metrics',
          inputSchema: {
            type: 'object',
            properties: {
              symbol: {
                type: 'string',
                description: 'Stock ticker symbol'
              }
            },
            required: ['symbol']
          }
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'get_ticker_price':
            return await this.handleGetTickerPrice(request.params.arguments);
          case 'get_market_report':
            return await this.handleGetMarketReport();
          case 'get_financial_statement': {
            if (!request.params.arguments || typeof request.params.arguments !== 'object') {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments');
            }
            const args = request.params.arguments as { statement: 'income' | 'balance' | 'cashflow'; symbol: string };
            return await this.handleGetFinancialStatement(args);
          }
          case 'get_company_overview': {
            if (!request.params.arguments || typeof request.params.arguments !== 'object') {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments');
            }
            const args = request.params.arguments as { symbol: string };
            return await this.handleGetCompanyOverview(args);
          }
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            content: [{
              type: 'text',
              text: `API error: ${error.response?.data?.['Error Message'] || error.message}`
            }],
            isError: true
          };
        }
        throw error;
      }
    });
  }

  private async handleGetTickerPrice(args: any) {
    const response = await this.axiosInstance.get('', {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol: args.symbol,
        interval: '1min',
        outputsize: 'compact'
      }
    });

    const latestData = response.data['Time Series (1min)'];
    const latestTimestamp = Object.keys(latestData)[0];
    const price = latestData[latestTimestamp]['1. open'];

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          symbol: args.symbol,
          price: price,
          timestamp: latestTimestamp
        }, null, 2)
      }]
    };
  }

  private async handleGetMarketReport() {
    const response = await this.axiosInstance.get('', {
      params: {
        function: 'MARKET_STATUS'
      }
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  private async handleGetFinancialStatement(args: { statement: 'income' | 'balance' | 'cashflow'; symbol: string }) {
    if (!args || typeof args !== 'object' ||
      !args.statement || !['income', 'balance', 'cashflow'].includes(args.statement)) {
      throw new McpError(ErrorCode.InvalidParams, 'Invalid statement parameter');
    }
    if (!args.symbol || typeof args.symbol !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'Invalid symbol parameter');
    }

    const functionMap = {
      income: 'INCOME_STATEMENT',
      balance: 'BALANCE_SHEET',
      cashflow: 'CASH_FLOW'
    };

    const response = await this.axiosInstance.get('', {
      params: {
        function: functionMap[args.statement],
        symbol: args.symbol
      }
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  private async handleGetCompanyOverview(args: { symbol: string }) {
    const response = await this.axiosInstance.get('', {
      params: {
        function: 'OVERVIEW',
        symbol: args.symbol
      }
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Stock Market MCP server running on stdio');
  }
}

const server = new StockMarketServer();
server.run().catch(console.error);
