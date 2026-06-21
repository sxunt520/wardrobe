import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnifyDatabaseCollation2026062100003 implements MigrationInterface {
  name = 'UnifyDatabaseCollation2026062100003';

  async up(queryRunner: QueryRunner): Promise<void> {
    const [{ databaseName }] = await queryRunner.query('SELECT DATABASE() AS databaseName');
    const escapedDatabase = String(databaseName).replace(/`/g, '``');

    await queryRunner.query(`ALTER DATABASE \`${escapedDatabase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

    const tables: Array<{ tableName: string }> = await queryRunner.query(
      `SELECT TABLE_NAME AS tableName
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_TYPE = 'BASE TABLE'
         AND TABLE_COLLATION <> 'utf8mb4_unicode_ci'`,
    );

    for (const { tableName } of tables) {
      const escapedTable = tableName.replace(/`/g, '``');
      await queryRunner.query(
        `ALTER TABLE \`${escapedTable}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
    }
  }

  async down(): Promise<void> {
    // Reverting would recreate the incompatible mixed-collation schema.
  }
}
