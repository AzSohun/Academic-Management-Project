using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcademicManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTeacherSubjectMtMRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClassSubjects",
                columns: table => new
                {
                    ClassesId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubjectsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassSubjects", x => new { x.ClassesId, x.SubjectsId });
                    table.ForeignKey(
                        name: "FK_ClassSubjects_ClassDetails_ClassesId",
                        column: x => x.ClassesId,
                        principalTable: "ClassDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassSubjects_Subjects_SubjectsId",
                        column: x => x.SubjectsId,
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClassSubjects_SubjectsId",
                table: "ClassSubjects",
                column: "SubjectsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClassSubjects");
        }
    }
}
