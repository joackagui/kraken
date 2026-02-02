import { Test, TestingModule } from '@nestjs/testing';
import { ProgramOfferingsController } from './program-offerings.controller';

describe('ProgramOfferingsController', () => {
  let controller: ProgramOfferingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramOfferingsController],
    }).compile();

    controller = module.get<ProgramOfferingsController>(ProgramOfferingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
