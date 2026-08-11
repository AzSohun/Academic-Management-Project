using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcademicManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddTeacherClassManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Students_ClassDetails_ClassDetailsId1",
                table: "Students");

            migrationBuilder.DropForeignKey(
                name: "FK_Teachers_ClassDetails_ClassDetailsId",
                table: "Teachers");

            migrationBuilder.DropIndex(
                name: "IX_Teachers_ClassDetailsId",
                table: "Teachers");

            migrationBuilder.DropIndex(
                name: "IX_Students_ClassDetailsId1",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ClassDetailsId",
                table: "Teachers");

            migrationBuilder.DropColumn(
                name: "ClassDetailsId1",
                table: "Students");

            migrationBuilder.CreateTable(
                name: "TeacherClasses",
                columns: table => new
                {
                    ClassesId = table.Column<Guid>(type: "uuid", nullable: false),
                    TeachersId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeacherClasses", x => new { x.ClassesId, x.TeachersId });
                    table.ForeignKey(
                        name: "FK_TeacherClasses_ClassDetails_ClassesId",
                        column: x => x.ClassesId,
                        principalTable: "ClassDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TeacherClasses_Teachers_TeachersId",
                        column: x => x.TeachersId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TeacherClasses_TeachersId",
                table: "TeacherClasses",
                column: "TeachersId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TeacherClasses");

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
                name: "IX_Teachers_ClassDetailsId",
                table: "Teachers",
                column: "ClassDetailsId");

            migrationBuilder.CreateIndex(
                name: "IX_Students_ClassDetailsId1",
                table: "Students",
                column: "ClassDetailsId1");

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
    }
}
