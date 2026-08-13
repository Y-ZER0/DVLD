import { MigrationInterface, QueryRunner } from "typeorm";

// Adds the missing UNIQUE constraint on Users.PersonID (2.1 REVIEW fix,
// user decision 2026-08-13): the domain rule "a person may hold at most
// one User row" is enforced in UsersService.create() with a 409, but the
// pre-check alone leaves a race under concurrent creates — the constraint
// makes the rule structural, like the Username UNIQUE already is.
export class AddUniquePersonIdToUsers1786620128823 implements MigrationInterface {
    name = 'AddUniquePersonIdToUsers1786620128823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "UQ_6a4c7a9a6a5f0b2c1d3e4f5a6b7c8" UNIQUE ("PersonID")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "UQ_6a4c7a9a6a5f0b2c1d3e4f5a6b7c8"`);
    }
}
