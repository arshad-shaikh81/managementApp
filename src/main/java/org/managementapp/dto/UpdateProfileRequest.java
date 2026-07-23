package org.managementapp.dto;

public class UpdateProfileRequest {
    private String name;
    private String flatNumber;
    private String address;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFlatNumber() { return flatNumber; }
    public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}