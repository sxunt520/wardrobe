import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex } from 'typeorm';

export class AddTryOnHistory2026062000001 implements MigrationInterface {
  name = 'AddTryOnHistory2026062000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('app_try_on_record'))) {
      await queryRunner.createTable(
        new Table({
          name: 'app_try_on_record',
          columns: [
            { name: 'record_id', type: 'varchar', length: '36', isPrimary: true },
            { name: 'user_id', type: 'varchar', length: '64' },
            { name: 'outfit_id', type: 'varchar', length: '36' },
            { name: 'outfit_title', type: 'varchar', length: '120', default: "''" },
            { name: 'scene', type: 'varchar', length: '32', default: "''" },
            { name: 'clothing_ids', type: 'text', isNullable: true },
            { name: 'person_image_url', type: 'varchar', length: '500', default: "''" },
            { name: 'top_garment_url', type: 'varchar', length: '500', default: "''" },
            { name: 'bottom_garment_url', type: 'varchar', length: '500', default: "''" },
            { name: 'result_image_url', type: 'varchar', length: '500', default: "''" },
            { name: 'task_id', type: 'varchar', length: '80', default: "''" },
            { name: 'try_on_status', type: 'varchar', length: '24', default: "'submitting'" },
            { name: 'error_message', type: 'varchar', length: '500', default: "''" },
            { name: 'create_by', type: 'varchar', length: '64', default: "''" },
            { name: 'create_time', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
            { name: 'update_by', type: 'varchar', length: '64', default: "''" },
            { name: 'update_time', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
            { name: 'remark', type: 'varchar', length: '500', isNullable: true },
            { name: 'status', type: 'char', length: '1', default: "'0'" },
            { name: 'del_flag', type: 'char', length: '1', default: "'0'" },
          ],
        }),
        true,
      );
      await queryRunner.createIndices('app_try_on_record', [
        new TableIndex({ name: 'idx_try_on_user_time', columnNames: ['user_id', 'create_time'] }),
        new TableIndex({ name: 'idx_try_on_outfit', columnNames: ['outfit_id'] }),
      ]);
    }

    if (await queryRunner.hasTable('app_outfit')) {
      const columns = [
        new TableColumn({ name: 'try_on_person_url', type: 'varchar', length: '500', default: "''" }),
        new TableColumn({ name: 'try_on_image_url', type: 'varchar', length: '500', default: "''" }),
        new TableColumn({ name: 'try_on_task_id', type: 'varchar', length: '80', default: "''" }),
        new TableColumn({ name: 'try_on_status', type: 'varchar', length: '24', default: "'idle'" }),
        new TableColumn({ name: 'try_on_error', type: 'varchar', length: '500', default: "''" }),
      ];
      for (const column of columns) {
        if (!(await queryRunner.hasColumn('app_outfit', column.name))) {
          await queryRunner.addColumn('app_outfit', column);
        }
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('app_try_on_record')) {
      await queryRunner.dropTable('app_try_on_record');
    }
  }
}
