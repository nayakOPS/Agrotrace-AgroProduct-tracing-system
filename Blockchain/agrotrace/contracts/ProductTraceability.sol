// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "./Registration.sol";

contract ProductTraceability {
    Registration public registrationContract;
    uint256 public batchCounter = 0;

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

    struct ProcessedBatch {
        address traderAddress;
        uint256 processingDate;
        uint256 packagingDate;
        string storageConditions;
        uint256 finalPricePerKg;
        string transportDetails;
        string qrCodeId;
    }

    struct NameInfo {
        string farmerName;
        string traderName;
        string productName;
    }

    struct PriceInfo {
        uint256 basePrice;
        uint256 finalPrice;
    }

    struct DateInfo {
        uint256 harvestDate;
        uint256 packagingDate;
    }

    struct QualityInfo {
        string qualityGrade;
        string certificationNumber;
        string qrCodeId;
    }

    struct ProductHistory {
        NameInfo names;
        PriceInfo prices;
        DateInfo dates;
        QualityInfo quality;
    }

    // Updated ProcessingRequest struct to include proposed final price
    struct ProcessingRequest {
        uint256 batchId;
        address traderAddress;
        uint256 proposedFinalPrice; // Added this field
        bool isApproved;
        bool isRejected;
        uint256 requestTimestamp;
    }

    mapping(uint256 => CropBatch) public cropBatches;
    mapping(uint256 => ProcessedBatch) public processedBatches;
    mapping(uint256 => ProcessingRequest) public processingRequests;

    event NewCropBatch(uint256 indexed batchId, address indexed farmer);
    event BatchProcessed(uint256 indexed batchId, address indexed trader);
    event ProcessingRequested(uint256 indexed batchId, address indexed trader, uint256 proposedPrice);
    event ProcessingApproved(uint256 indexed batchId, address indexed trader);
    event ProcessingRejected(uint256 indexed batchId, address indexed trader);

    constructor(address _registrationAddress) {
        registrationContract = Registration(_registrationAddress);
    }

    modifier onlyFarmer() {
        require(
            keccak256(abi.encodePacked(registrationContract.getRole(msg.sender))) ==
                keccak256(abi.encodePacked("Farmer")),
            "Only registered farmers"
        );
        _;
    }

    modifier onlyTrader() {
        require(
            keccak256(abi.encodePacked(registrationContract.getRole(msg.sender))) ==
                keccak256(abi.encodePacked("AgroTrader")),
            "Only registered traders"
        );
        _;
    }

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

    // Updated requestProcessing function to include proposed final price
    function requestProcessing(uint256 _batchId, uint256 _proposedFinalPrice) external onlyTrader {
        require(cropBatches[_batchId].farmerAddress != address(0), "Invalid batch ID");
        require(processedBatches[_batchId].traderAddress == address(0), "Batch already processed");
        require(processingRequests[_batchId].traderAddress == address(0), "Processing request already exists");
        require(_proposedFinalPrice > 0, "Proposed final price must be greater than 0");

        processingRequests[_batchId] = ProcessingRequest({
            batchId: _batchId,
            traderAddress: msg.sender,
            proposedFinalPrice: _proposedFinalPrice,
            isApproved: false,
            isRejected: false,
            requestTimestamp: block.timestamp
        });

        emit ProcessingRequested(_batchId, msg.sender, _proposedFinalPrice);
    }

    function approveProcessing(uint256 _batchId) external onlyFarmer {
        ProcessingRequest storage request = processingRequests[_batchId];
        require(request.traderAddress != address(0), "No processing request found");
        require(cropBatches[_batchId].farmerAddress == msg.sender, "Not the batch owner");
        require(!request.isApproved && !request.isRejected, "Request already processed");

        request.isApproved = true;
        emit ProcessingApproved(_batchId, request.traderAddress);
    }

    function rejectProcessing(uint256 _batchId) external onlyFarmer {
        ProcessingRequest storage request = processingRequests[_batchId];
        require(request.traderAddress != address(0), "No processing request found");
        require(cropBatches[_batchId].farmerAddress == msg.sender, "Not the batch owner");
        require(!request.isApproved && !request.isRejected, "Request already processed");

        request.isRejected = true;
        emit ProcessingRejected(_batchId, request.traderAddress);
    }

    function processBatch(
        uint256 _batchId,
        uint256 _processingDate,
        uint256 _packagingDate,
        string memory _storageConditions,
        string memory _transportDetails,
        string memory _qrCodeId
    ) external onlyTrader {
        require(cropBatches[_batchId].farmerAddress != address(0), "Invalid batch ID");
        require(processedBatches[_batchId].traderAddress == address(0), "Batch already processed");
        
        ProcessingRequest storage request = processingRequests[_batchId];
        require(request.traderAddress == msg.sender, "Not the requesting trader");
        require(request.isApproved, "Processing request not approved");
        require(!request.isRejected, "Processing request was rejected");

        // Use the proposed final price from the processing request
        processedBatches[_batchId] = ProcessedBatch({
            traderAddress: msg.sender,
            processingDate: _processingDate,
            packagingDate: _packagingDate,
            storageConditions: _storageConditions,
            finalPricePerKg: request.proposedFinalPrice, // Use proposed price
            transportDetails: _transportDetails,
            qrCodeId: _qrCodeId
        });

        emit BatchProcessed(_batchId, msg.sender);
    }

    function getProductHistory(uint256 _batchId) external view returns (ProductHistory memory) {
        CropBatch memory crop = cropBatches[_batchId];
        ProcessedBatch memory processed = processedBatches[_batchId];
        require(crop.farmerAddress != address(0), "Invalid batch ID");

        NameInfo memory names;
        PriceInfo memory prices;
        DateInfo memory dates;
        QualityInfo memory quality;

        {
            Registration.Farmer memory farmer = registrationContract.getFarmerDetails(crop.farmerAddress);
            names.farmerName = farmer.name;
            names.productName = crop.productName;
        }

        {
            Registration.AgroTrader memory trader = registrationContract.getAgroTraderDetails(processed.traderAddress);
            names.traderName = trader.businessName;
        }

        prices.basePrice = crop.basePricePerKg;
        prices.finalPrice = processed.finalPricePerKg;

        dates.harvestDate = crop.harvestDate;
        dates.packagingDate = processed.packagingDate;

        quality.qualityGrade = crop.qualityGrade;
        quality.certificationNumber = crop.certificationNumber;
        quality.qrCodeId = processed.qrCodeId;

        return ProductHistory({
            names: names,
            prices: prices,
            dates: dates,
            quality: quality
        });
    }

    function getProcessingRequest(uint256 _batchId) external view returns (ProcessingRequest memory) {
        return processingRequests[_batchId];
    }

    // New function to get trader details for a processing request
    function getTraderNameForRequest(uint256 _batchId) external view returns (string memory) {
        ProcessingRequest memory request = processingRequests[_batchId];
        require(request.traderAddress != address(0), "No processing request found");
        
        Registration.AgroTrader memory trader = registrationContract.getAgroTraderDetails(request.traderAddress);
        return trader.businessName;
    }
}