import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlignSysJobSchema2026062100002 implements MigrationInterface {
  name = 'AlignSysJobSchema2026062100002';

  async up(queryRunner: QueryRunner): Promise<void> {
    if ((await queryRunner.hasTable('sys_job')) && !(await queryRunner.hasColumn('sys_job', 'del_flag'))) {
      await queryRunner.addColumn(
        'sys_job',
        new TableColumn({
          name: 'del_flag',
          type: 'char',
          length: '1',
          default: "'0'",
          comment: '删除标志',
        }),
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if ((await queryRunner.hasTable('sys_job')) && (await queryRunner.hasColumn('sys_job', 'del_flag'))) {
      await queryRunner.dropColumn('sys_job', 'del_flag');
    }
  }
}
