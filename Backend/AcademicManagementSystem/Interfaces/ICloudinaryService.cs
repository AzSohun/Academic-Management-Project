namespace AcademicManagementSystem.Interfaces
{
    public interface ICloudinaryService
    {
        Task<string> UploadFileAsync(IFormFile file, string folderName);
        Task<bool> DeleteFileAsync(string publicId);
    }
}
