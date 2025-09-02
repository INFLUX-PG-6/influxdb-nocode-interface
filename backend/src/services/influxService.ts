import { InfluxDB } from '@influxdata/influxdb-client';
import { InfluxDBCredentials } from '../types';
import logger from '../utils/logger';

class InfluxService {
  private clients: Map<string, InfluxDB> = new Map();

  /**
   * 创建或获取InfluxDB客户端
   */
  getClient(credentials: InfluxDBCredentials): InfluxDB {
    const clientKey = `${credentials.url}_${credentials.org}`;
    
    let client = this.clients.get(clientKey);
    if (!client) {
      client = new InfluxDB({
        url: credentials.url,
        token: credentials.token
      });
      this.clients.set(clientKey, client);
      logger.info(`Created new InfluxDB client for ${credentials.url}`);
    }
    
    return client;
  }

  /**
   * 测试InfluxDB连接
   */
  async testConnection(credentials: InfluxDBCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const client = this.getClient(credentials);
      
      // 使用查询API来测试连接，这是更可靠的方法
      const queryApi = client.getQueryApi(credentials.org);
      
      // 执行一个简单的查询来测试连接
      const query = `buckets() |> limit(n:1)`;
      
      // 使用Promise包装查询结果
      await new Promise<void>((resolve, reject) => {
        queryApi.queryRows(query, {
          next: () => {
            // 有数据返回说明连接成功
            resolve();
          },
          error: (error: Error) => {
            reject(error);
          },
          complete: () => {
            // 查询完成，连接成功
            resolve();
          }
        });
      });
      
      logger.info(`Successfully connected to InfluxDB: ${credentials.url} (org: ${credentials.org})`);
      return { success: true };
      
    } catch (error: any) {
      logger.error(`InfluxDB connection failed: ${error.message}`, {
        url: credentials.url,
        org: credentials.org,
        error: error.message
      });

      return {
        success: false,
        error: this.parseInfluxError(error)
      };
    }
  }

  /**
   * 解析InfluxDB错误并返回用户友好的消息
   */
  private parseInfluxError(error: any): string {
    const message = error.message || '';
    
    if (message.includes('ECONNREFUSED') || message.includes('fetch')) {
      return 'Cannot connect to InfluxDB server. Please check the URL and ensure InfluxDB is running.';
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'Invalid API token. Please check your token and try again.';
    }
    
    if (message.includes('organization') || message.includes('org')) {
      return 'Organization not found. Please check the organization name.';
    }
    
    if (message.includes('timeout')) {
      return 'Connection timeout. Please check your network and try again.';
    }

    if (message.includes('400')) {
      return 'Bad request. Please check your connection parameters.';
    }

    if (message.includes('403')) {
      return 'Access forbidden. Please check your API token permissions.';
    }
    
    // 默认错误消息
    return 'Connection failed. Please check your InfluxDB configuration.';
  }

  /**
   * 清理客户端缓存
   */
  clearClients(): void {
    this.clients.clear();
    logger.info('Cleared all InfluxDB clients');
  }

  /**
   * 获取活跃客户端数量
   */
  getActiveClientCount(): number {
    return this.clients.size;
  }
}

// 单例模式
export const influxService = new InfluxService();
