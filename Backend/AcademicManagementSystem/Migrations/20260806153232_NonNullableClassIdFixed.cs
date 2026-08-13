using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcademicManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class NonNullableClassIdFixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Students_ClassDetails_ClassDetailsId",
                table: "Students");

            migrationBuilder.AlterColumn<Guid>(
                name: "ClassDetailsId",
                table: "Students",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_Students_ClassDetails_ClassDetailsId",
                table: "Students",
                column: "ClassDetailsId",
                principalTable: "ClassDetails",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Students_ClassDetails_ClassDetailsId",
                table: "Students");

            migrationBuilder.AlterColumn<Guid>(
                name: "ClassDetailsId",
                table: "Students",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Students_ClassDetails_ClassDetailsId",
                table: "Students",
                column: "ClassDetailsId",
                principalTable: "ClassDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
