import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client } from 'pg';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class PgListenService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private readonly logger = new Logger(PgListenService.name);

  constructor(private readonly eventsGateway: EventsGateway) {}

  async onModuleInit() {
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    try {
      await this.client.connect();
      this.logger.log('Connected to PostgreSQL for LISTEN');

      this.client.on('notification', (msg) => {
        if (msg.channel === 'data_changes') {
          const payload = JSON.parse(msg.payload || '{}');
          this.logger.log(`Received data change: ${msg.payload}`);
          this.eventsGateway.broadcast('data_change', payload);
        }
      });

      await this.client.query('LISTEN data_changes');
    } catch (e) {
      this.logger.error('Failed to connect PG client for LISTEN', e);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.end();
    }
  }
}
