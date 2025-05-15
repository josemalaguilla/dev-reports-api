import { DevelopersPaginatedList } from '../../../../../src/modules/developers/application/dtos/developers.paginated-list';
import { Developer } from '../../../../../src/modules/developers/domain/entities/developer';
import { DeveloperMother } from '../../domain/entities/developer.mother';

describe('DevelopersPaginatedList', () => {
  it('should create valid command', () => {
    const items = [DeveloperMother.random()];
    const total = 10;

    const command = new DevelopersPaginatedList(items, total);

    expect(command.total).toBe(total);
    expectToHaveParsedItemsIntoPrimitives(command, items);
  });

  function expectToHaveParsedItemsIntoPrimitives(
    command: DevelopersPaginatedList,
    originalItems: Developer[],
  ): void {
    let index = 0;
    for (const item of command.items) {
      expect(item).toEqual(originalItems[index].toPrimitives());
      index++;
    }
  }
});
