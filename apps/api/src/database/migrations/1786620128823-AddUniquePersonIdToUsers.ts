import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniquePersonIdToUsers1786620128823 implements MigrationInterface {
    name = 'AddUniquePersonIdToUsers1786620128823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "UQ_6a4c7a9a6a5f0b2c1d3e4f5a6b7c8" UNIQUE ("PersonID")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "UQ_6a4c7a9a6a5f0b2c1d3e4f5a6b7c8"`);
    }
}
