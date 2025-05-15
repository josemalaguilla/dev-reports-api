import { DeveloperWithPrimitives } from 'src/modules/developers/domain/entities/developer';

export class DeveloperComparator {
  public areEquals(
    developer: DeveloperWithPrimitives,
    otherDeveloper: DeveloperWithPrimitives,
  ): boolean {
    const hasSameFields =
      Object.keys(developer).length === Object.keys(otherDeveloper).length;
    if (!hasSameFields) return false;

    let equals = true;
    for (const fieldName in developer) {
      if (Object.prototype.hasOwnProperty.call(developer, fieldName)) {
        const fieldValue = developer[fieldName];
        equals = fieldValue === otherDeveloper[fieldName];
      }
    }
    return equals;
  }
}
