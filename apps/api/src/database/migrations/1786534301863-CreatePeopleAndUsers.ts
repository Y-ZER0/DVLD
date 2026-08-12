import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePeopleAndUsers1786534301863 implements MigrationInterface {
    name = 'CreatePeopleAndUsers1786534301863'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."gender_enum" AS ENUM('Male', 'Female')`);
        await queryRunner.query(`CREATE TABLE "People" ("PersonID" SERIAL NOT NULL, "NationalNumber" character varying NOT NULL, "FirstName" character varying NOT NULL, "LastName" character varying NOT NULL, "DateOfBirth" date NOT NULL, "PhotoUrl" character varying, "Gender" "public"."gender_enum" NOT NULL, "Address" character varying NOT NULL, "Phone" character varying NOT NULL, "Email" character varying NOT NULL, "CountryName" character varying NOT NULL, CONSTRAINT "UQ_d1bf1a9d7d9b388ab440971f99c" UNIQUE ("NationalNumber"), CONSTRAINT "PK_34832fc96677d2059c932179ba1" PRIMARY KEY ("PersonID"))`);
        await queryRunner.query(`CREATE TABLE "Users" ("UserID" SERIAL NOT NULL, "PersonID" integer NOT NULL, "Username" character varying NOT NULL, "Password" character varying NOT NULL, "IsActive" boolean NOT NULL, CONSTRAINT "UQ_a842ddfeb687f3df0f862ca73ea" UNIQUE ("Username"), CONSTRAINT "PK_fe45fe4ee5317851eb4746a23d8" PRIMARY KEY ("UserID"))`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_8c51f7d68e073d104f665a95827" FOREIGN KEY ("PersonID") REFERENCES "People"("PersonID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_8c51f7d68e073d104f665a95827"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TABLE "People"`);
        await queryRunner.query(`DROP TYPE "public"."gender_enum"`);
    }

}
