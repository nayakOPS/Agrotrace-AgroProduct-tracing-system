// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Registration.sol";

contract ProductTraceability {
    Registration public registrationContract;
    uint256 public batchCounter = 0;

    // Farmer-provided information about the raw agricultural product
    struct CropBatch {
        address farmerAddress;
        string productName;
        uint256 quantity;
        string qualityGrade;
        uint256 harvestDate;
        string farmLocation;
        uint256 basePricePerKg;
        string certificationNumber;
    }

    // Trader-provided information about the processed/packaged product
    struct ProcessedBatch {
        address traderAddress;
        uint256 processingDate;
        uint256 packagingDate;
        string storageConditions;
        uint256 finalPricePerKg;
        string transportDetails;
        string qrCodeId;
    }

    // Stores all farmer-submitted crop information by batch ID
    mapping(uint256 => CropBatch) public cropBatches;
    // Stores all trader-processed information by the same batch ID
    mapping(uint256 => ProcessedBatch) public processedBatches;

    event NewCropBatch(uint256 indexed batchId, address indexed farmer);
    event BatchProcessed(uint256 indexed batchId, address indexed trader);

    // Constructor to set the address of the Registration contract deployed address
    constructor(address _registrationAddress) {
        registrationContract = Registration(_registrationAddress);
    }

    // restrict access to only registered farmers
    modifier onlyFarmer() {
        require(
            keccak256(abi.encodePacked(registrationContract.getRole(msg.sender))) == 
            keccak256(abi.encodePacked("Farmer")),
            "Only registered farmers"
        );
        _;
    }

    // restrict access to only registered traders
    modifier onlyTrader() {
        require(
            keccak256(abi.encodePacked(registrationContract.getRole(msg.sender))) == 
            keccak256(abi.encodePacked("AgroTrader")),
            "Only registered traders"
        );
        _;
    }

    // creates a new batch with a unique ID that follows the product through the 
    function addCropBatch(
        string memory _productName,
        uint256 _quantity,
        string memory _qualityGrade,
        uint256 _harvestDate,
        string memory _farmLocation,
        uint256 _basePricePerKg,
        string memory _certificationNumber
    ) external onlyFarmer {
        batchCounter++;
        cropBatches[batchCounter] = CropBatch({
            farmerAddress: msg.sender,
            productName: _productName,
            quantity: _quantity,
            qualityGrade: _qualityGrade,
            harvestDate: _harvestDate,
            farmLocation: _farmLocation,
            basePricePerKg: _basePricePerKg,
            certificationNumber: _certificationNumber
        });
        emit NewCropBatch(batchCounter, msg.sender);
    }

    // Trader processes the batch and adds information about the processing and packaging, should add BatchID respective of the product they are processing
    function processBatch(
        uint256 _batchId,
        uint256 _processingDate,
        uint256 _packagingDate,
        string memory _storageConditions,
        uint256 _finalPricePerKg,
        string memory _transportDetails,
        string memory _qrCodeId
    ) external onlyTrader {
        require(cropBatches[_batchId].farmerAddress != address(0), "Invalid batch ID");
        require(processedBatches[_batchId].traderAddress == address(0), "Batch already processed");

        processedBatches[_batchId] = ProcessedBatch({
            traderAddress: msg.sender,
            processingDate: _processingDate,
            packagingDate: _packagingDate,
            storageConditions: _storageConditions,
            finalPricePerKg: _finalPricePerKg,
            transportDetails: _transportDetails,
            qrCodeId: _qrCodeId
        });
        emit BatchProcessed(_batchId, msg.sender);
    }

    // Function to retrieve the product history by batch ID, key function for the QR code
    function getProductHistory(uint256 _batchId) external view returns (
        address farmer,
        address trader,
        string memory productName,
        uint256 basePrice,
        uint256 finalPrice,
        uint256 harvestDate,
        uint256 packagingDate,
        string memory qualityGrade,
        string memory certificationNumber,
        string memory qrCodeId
    ) {
        CropBatch memory crop = cropBatches[_batchId];
        ProcessedBatch memory processed = processedBatches[_batchId];

        require(crop.farmerAddress != address(0), "Invalid batch ID");

        return (
            crop.farmerAddress,
            processed.traderAddress,
            crop.productName,
            crop.basePricePerKg,
            processed.finalPricePerKg,
            crop.harvestDate,
            processed.packagingDate,
            crop.qualityGrade,
            crop.certificationNumber,
            processed.qrCodeId
        );
    }
}