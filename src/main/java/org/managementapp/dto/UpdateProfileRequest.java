package org.managementapp.dto;

public class UpdateProfileRequest {
    private String name;
    private String flatNumber;
    private String address;
    private String avatar; // base64 data-URL, e.g. "data:image/png;base64,...". Null/omitted = leave unchanged.
    private boolean clearAvatar; // true = user clicked "Set default", remove the stored photo

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFlatNumber() { return flatNumber; }
    public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public boolean isClearAvatar() { return clearAvatar; }
    public void setClearAvatar(boolean clearAvatar) { this.clearAvatar = clearAvatar; }
}