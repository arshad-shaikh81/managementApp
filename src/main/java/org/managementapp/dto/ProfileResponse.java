package org.managementapp.dto;

public class ProfileResponse {
    private String name;
    private String email;
    private String phone;
    private String role;
    private String flatNumber;
    private String societyName;
    private String societyAddress;
    private String avatar; // base64 data-URL of the profile photo, e.g. "data:image/png;base64,..."

    public ProfileResponse(String name, String email, String phone, String role,
                           String flatNumber, String societyName, String societyAddress,
                           String avatar) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.flatNumber = flatNumber;
        this.societyName = societyName;
        this.societyAddress = societyAddress;
        this.avatar = avatar;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFlatNumber() { return flatNumber; }
    public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }

    public String getSocietyName() { return societyName; }
    public void setSocietyName(String societyName) { this.societyName = societyName; }

    public String getSocietyAddress() { return societyAddress; }
    public void setSocietyAddress(String societyAddress) { this.societyAddress = societyAddress; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}