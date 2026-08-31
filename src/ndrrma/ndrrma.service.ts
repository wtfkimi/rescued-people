import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RescuedPerson, RescuedPersonsPage } from './ndrrma.types';

@Injectable()
export class NdrrmaService {
  private readonly logger = new Logger(NdrrmaService.name);

  private readonly baseUrl: string;
  private readonly nationality: string;
  private readonly pageSize: number;
  private readonly timeoutMs: number;
  private readonly maxPages: number;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>(
      'NDRRMA_API_URL',
      'https://ndrrma.gov.np/api/v1/rescues/rescued-persons/',
    );
    this.nationality = this.config.get<string>('NDRRMA_NATIONALITY', 'foreign');
    this.pageSize = Number(this.config.get('NDRRMA_PAGE_SIZE', 100));
    this.timeoutMs = Number(this.config.get('NDRRMA_TIMEOUT_MS', 20000));
    this.maxPages = Number(this.config.get('NDRRMA_MAX_PAGES', 100));
  }

  async fetchAllRescuedPersons(): Promise<RescuedPerson[]> {
    const persons: RescuedPerson[] = [];
    const seen = new Set<number>();
    let offset = 0;

    for (let page = 0; page < this.maxPages; page += 1) {
      const url = new URL(this.baseUrl);
      url.searchParams.set('limit', String(this.pageSize));
      url.searchParams.set('offset', String(offset));
      url.searchParams.set('nationality', this.nationality);

      const data = await this.fetchPage(url.toString());

      for (const person of data.results ?? []) {
        if (!seen.has(person.id)) {
          seen.add(person.id);
          persons.push(person);
        }
      }

      if (!data.next || !data.results?.length) {
        break;
      }
      offset += this.pageSize;
    }

    this.logger.log(`Fetched ${persons.length} rescued persons (${this.nationality})`);
    return persons;
  }

  private async fetchPage(url: string): Promise<RescuedPersonsPage> {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'rescued-people-nepal-bot/1.0 (+telegram notifier)',
      },
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`NDRRMA API responded ${response.status} for ${url}`);
    }

    return (await response.json()) as RescuedPersonsPage;
  }
}
