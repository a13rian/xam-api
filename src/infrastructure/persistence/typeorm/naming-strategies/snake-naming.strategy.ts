import { DefaultNamingStrategy, NamingStrategyInterface, Table } from 'typeorm';

export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(targetName: string, userSpecifiedName: string | undefined): string {
    return userSpecifiedName ?? this.toSnakeCase(targetName);
  }

  columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ): string {
    const prefix = embeddedPrefixes.map((p) => this.toSnakeCase(p)).join('_');
    const name = customName ?? this.toSnakeCase(propertyName);
    return prefix ? `${prefix}_${name}` : name;
  }

  relationName(propertyName: string): string {
    return this.toSnakeCase(propertyName);
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return this.toSnakeCase(`${relationName}_${referencedColumnName}`);
  }

  joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string,
  ): string {
    return this.toSnakeCase(
      `${firstTableName}_${firstPropertyName}_${secondTableName}`,
    );
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return this.toSnakeCase(`${tableName}_${columnName ?? propertyName}`);
  }

  primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const tableName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    return `pk_${tableName}_${columnNames.join('_')}`;
  }

  foreignKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const tableName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    return `fk_${tableName}_${columnNames.join('_')}`;
  }

  indexName(tableOrName: Table | string, columnNames: string[]): string {
    const tableName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    return `idx_${tableName}_${columnNames.join('_')}`;
  }

  uniqueConstraintName(
    tableOrName: Table | string,
    columnNames: string[],
  ): string {
    const tableName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    return `uq_${tableName}_${columnNames.join('_')}`;
  }

  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
      .replace(/([a-z\d])([A-Z])/g, '$1_$2')
      .replace(/-/g, '_')
      .toLowerCase();
  }
}
