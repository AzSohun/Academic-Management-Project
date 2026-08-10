using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcademicManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddTeacherClassRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Students_ClassDetails_ClassDetailsId",
                table: "Students");

            migrationBuilder.AddColumn<Guid>(
                name: "ClassDetailsId",
                table: "Teachers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ClassDetailsId1",
                table: "Students",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Teachers_ClassDetailsId",
                table: "Teachers",
                column: "ClassDetailsId");

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_SubjectCode",
                table: "Subjects",
                column: "SubjectCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Students_ClassDetailsId1",
                table: "Students",
                column: "ClassDetailsId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Students_ClassDetails_ClassDetailsId",
                table: "Students",
                column: "ClassDetailsId",
                principalTable: "ClassDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Students_ClassDetails_ClassDetailsId1",
                table: "Students",
                column: "ClassDetailsId1",
                principalTable: "ClassDetails",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Teachers_ClassDetails_ClassDetailsId",
                table: "Teachers",
                column: "ClassDetailsId",
                principalTable: "ClassDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Students_ClassDetails_ClassDetailsId",
                table: "Students");

            migrationBuilder.DropForeignKey(
                name: "FK_Students_ClassDetails_ClassDetailsId1",
                table: "Students");

            migrationBuilder.DropForeignKey(
                name: "FK_Teachers_ClassDetails_ClassDetailsId",
                table: "Teachers");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Teachers_ClassDetailsId",
                table: "Teachers");

            migrationBuilder.DropIndex(
                name: "IX_Subjects_SubjectCode",
                table: "Subjects");

            migrationBuilder.DropIndex(
                name: "IX_Students_ClassDetailsId1",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ClassDetailsId",
                table: "Teachers");

            migrationBuilder.DropColumn(
                name: "ClassDetailsId1",
                table: "Students");

            migrationBuilder.AddForeignKey(
                name: "FK_Students_ClassDetails_ClassDetailsId",
                table: "Students",
                column: "ClassDetailsId",
                principalTable: "ClassDetails",
                principalColumn: "Id");
        }
    }
}
