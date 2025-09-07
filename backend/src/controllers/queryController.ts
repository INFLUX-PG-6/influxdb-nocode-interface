import { Request, Response } from 'express';
import { influxService } from '../services/influxService';
import { ApiResponse } from '../types';
import logger from '../utils/logger';

/**
 * Execute Flux query
 */
export const executeQuery = async (req: Request, res: Response) => {
  try {
    const session = req.session!;
    const { query, limit = 100 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    const client = influxService.getClient(session.credentials);
    const queryApi = client.getQueryApi(session.credentials.org);

    // 添加限制以防止查询过大
    const limitedQuery = query.includes('|> limit(') ? query : `${query} |> limit(n: ${limit})`;

    const results: any[] = [];
    let columns: string[] = [];
    
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(limitedQuery, {
        next: (row: string[], tableMeta) => {
          // 如果是第一行，保存列名
          if (columns.length === 0) {
            columns = tableMeta.columns.map(col => col.label);
          }
          
          // 将行数据转换为对象
          const rowObject: any = {};
          row.forEach((value, index) => {
            rowObject[columns[index]] = value;
          });
          
          results.push(rowObject);
        },
        error: (error: Error) => {
          reject(error);
        },
        complete: () => {
          resolve();
        }
      });
    });

    const response: ApiResponse = {
      success: true,
      data: {
        columns,
        rows: results,
        totalRows: results.length,
        query: limitedQuery,
        executionTime: Date.now()
      }
    };

    logger.info(`Query executed successfully: ${results.length} rows returned for org: ${session.credentials.org}`);
    res.json(response);

  } catch (error: any) {
    logger.error('Query execution failed:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Query execution failed'
    };
    
    res.status(500).json(response);
  }
};

/**
 * 验证Flux查询语法
 */
export const validateQuery = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    // 基本语法检查
    const hasFrom = query.includes('from(');
    const hasRange = query.includes('range(') || query.includes('start:');
    
    const issues: string[] = [];
    
    if (!hasFrom) {
      issues.push('Query should start with from() function');
    }
    
    if (!hasRange) {
      issues.push('Query should include range() or start parameter');
    }

    const response: ApiResponse = {
      success: issues.length === 0,
      data: {
        valid: issues.length === 0,
        issues,
        suggestions: issues.length > 0 ? [
          'Try: from(bucket: "your-bucket") |> range(start: -1h)'
        ] : []
      }
    };

    res.json(response);

  } catch (error: any) {
    logger.error('Query validation failed:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Query validation failed'
    };
    
    res.status(500).json(response);
  }
};

/**
 * 获取查询建议/模板
 */
export const getQueryTemplates = async (req: Request, res: Response) => {
  try {
    const templates = [
      {
        name: 'Basic Data Query',
        description: 'Get recent data from a measurement',
        query: 'from(bucket: "your-bucket")\n  |> range(start: -1h)\n  |> filter(fn: (r) => r._measurement == "your-measurement")',
        category: 'basic'
      },
      {
        name: 'Aggregated Data',
        description: 'Get average values over time windows',
        query: 'from(bucket: "your-bucket")\n  |> range(start: -24h)\n  |> filter(fn: (r) => r._measurement == "your-measurement")\n  |> aggregateWindow(every: 1h, fn: mean)',
        category: 'aggregation'
      },
      {
        name: 'Multiple Fields',
        description: 'Query multiple fields from a measurement',
        query: 'from(bucket: "your-bucket")\n  |> range(start: -1h)\n  |> filter(fn: (r) => r._measurement == "your-measurement")\n  |> filter(fn: (r) => r._field == "temperature" or r._field == "humidity")',
        category: 'multi-field'
      }
    ];

    const response: ApiResponse = {
      success: true,
      data: templates
    };

    res.json(response);

  } catch (error: any) {
    logger.error('Failed to get query templates:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to get query templates'
    };
    
    res.status(500).json(response);
  }
};
