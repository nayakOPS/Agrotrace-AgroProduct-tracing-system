// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Registration {
    
    enum Role { None, Farmer, AgroTrader }

    struct Farmer {
        string name;
        string addressDetails;
        string email;
        string phoneNumber;
        string citizenshipId;
        string photoLink;
        string location;
    }

    struct AgroTrader {
        string businessName;
        string email;
        string phoneNumber;
        string panVatNumber;
        string warehouseLocation;
    }

    mapping(address => Role) private roles;
    mapping(address => Farmer) private farmers;
    mapping(address => AgroTrader) private agroTraders;

    event FarmerRegistered(address indexed farmer, string name);
    event AgroTraderRegistered(address indexed agroTrader, string businessName);

    modifier notRegistered(address _wallet) {
        require(roles[_wallet] == Role.None, "Address already registered");
        _;
    }

    function registerFarmer(
        string memory _name,
        string memory _addressDetails,
        string memory _email,
        string memory _phoneNumber,
        string memory _citizenshipId,
        string memory _photoLink,
        string memory _location
    ) external notRegistered(msg.sender) {
        farmers[msg.sender] = Farmer({
            name: _name,
            addressDetails: _addressDetails,
            email: _email,
            phoneNumber: _phoneNumber,
            citizenshipId: _citizenshipId,
            photoLink: _photoLink,
            location: _location
        });
        roles[msg.sender] = Role.Farmer;
        emit FarmerRegistered(msg.sender, _name);
    }

    function registerAgroTrader(
        string memory _businessName,
        string memory _email,
        string memory _phoneNumber,
        string memory _panVatNumber,
        string memory _warehouseLocation
    ) external notRegistered(msg.sender) {
        agroTraders[msg.sender] = AgroTrader({
            businessName: _businessName,
            email: _email,
            phoneNumber: _phoneNumber,
            panVatNumber: _panVatNumber,
            warehouseLocation: _warehouseLocation
        });
        roles[msg.sender] = Role.AgroTrader;
        emit AgroTraderRegistered(msg.sender, _businessName);
    }

    // Function to get the role of a wallet address
    function getRole(address _wallet) external view returns (string memory) {
        if (roles[_wallet] == Role.Farmer) {
            return "Farmer";
        } else if (roles[_wallet] == Role.AgroTrader) {
            return "AgroTrader";
        } else {
            return "None";
        }
    }

    // Function to get farmer details
    function getFarmerDetails(address _wallet) external view returns (Farmer memory) {
        require(roles[_wallet] == Role.Farmer, "Not a farmer");
        return farmers[_wallet];
    }

    // Function to get agro trader details
    function getAgroTraderDetails(address _wallet) external view returns (AgroTrader memory) {
        require(roles[_wallet] == Role.AgroTrader, "Not an agro trader");
        return agroTraders[_wallet];
    }
}
