using PlacementAnalytics.Application.DTOs.Company;

namespace PlacementAnalytics.Application.Validators;

public static class CompanyValidators
{
    public static (bool isValid, string error) ValidateCreateCompany(CreateCompanyDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return (false, "Company name is required.");
        if (string.IsNullOrWhiteSpace(dto.JobRole))
            return (false, "Job role is required.");
        if (dto.PackageLpa <= 0)
            return (false, "Package must be greater than 0.");
        if (dto.EligibilityCgpa < 0 || dto.EligibilityCgpa > 10)
            return (false, "CGPA must be between 0 and 10.");
        if (dto.MaxBacklogsAllowed < 0)
            return (false, "Max backlogs cannot be negative.");
        return (true, string.Empty);
    }
}
