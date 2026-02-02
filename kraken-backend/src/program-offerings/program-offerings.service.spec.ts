import { Test, TestingModule } from '@nestjs/testing';
import { ProgramOfferingsService } from './program-offerings.service';

describe('ProgramOfferingsService', () => {
  let service: ProgramOfferingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgramOfferingsService],
    }).compile();

    service = module.get<ProgramOfferingsService>(ProgramOfferingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
