# ThirdWeb Contract Integration Documentation

This document contains all the ThirdWeb React code snippets for interacting with your deployed smart contract ProductTraceability. This serves as a comprehensive reference for contract events, read functions, and write functions.

## Contract Events

### BatchProcessed Event
This event is emitted when a crop batch has been successfully processed by a trader.

```javascript
import { prepareEvent } from "thirdweb";
import { useContractEvents } from "thirdweb/react";

const preparedEvent = prepareEvent({
  signature: "event BatchProcessed(uint256 indexed batchId, address indexed trader)",
});

export default function Component() {
  const { data: event } = useContractEvents({
    contract,
    events: [preparedEvent],
  });
}
```

### NewCropBatch Event
This event is emitted when a farmer adds a new crop batch to the system.

```javascript
import { prepareEvent } from "thirdweb";
import { useContractEvents } from "thirdweb/react";

const preparedEvent = prepareEvent({
  signature: "event NewCropBatch(uint256 indexed batchId, address indexed farmer)",
});

export default function Component() {
  const { data: event } = useContractEvents({
    contract,
    events: [preparedEvent],
  });
}
```

### ProcessingApproved Event
This event is emitted when a farmer approves a trader's processing request for a crop batch.

```javascript
import { prepareEvent } from "thirdweb";
import { useContractEvents } from "thirdweb/react";

const preparedEvent = prepareEvent({
  signature: "event ProcessingApproved(uint256 indexed batchId, address indexed trader)",
});

export default function Component() {
  const { data: event } = useContractEvents({
    contract,
    events: [preparedEvent],
  });
}
```

### ProcessingRejected Event
This event is emitted when a farmer rejects a trader's processing request for a crop batch.

```javascript
import { prepareEvent } from "thirdweb";
import { useContractEvents } from "thirdweb/react";

const preparedEvent = prepareEvent({
  signature: "event ProcessingRejected(uint256 indexed batchId, address indexed trader)",
});

export default function Component() {
  const { data: event } = useContractEvents({
    contract,
    events: [preparedEvent],
  });
}
```

### ProcessingRequested Event
This event is emitted when a trader requests to process a crop batch with a proposed price.

```javascript
import { prepareEvent } from "thirdweb";
import { useContractEvents } from "thirdweb/react";

const preparedEvent = prepareEvent({
  signature: "event ProcessingRequested(uint256 indexed batchId, address indexed trader, uint256 proposedPrice)",
});

export default function Component() {
  const { data: event } = useContractEvents({
    contract,
    events: [preparedEvent],
  });
}
```

## Read Functions

### batchCounter
Returns the total number of crop batches created in the system.

```javascript
import { useReadContract } from "thirdweb/react";

export default function Component() {
  const { data, isPending } = useReadContract({
    contract,
    method: "function batchCounter() view returns (uint256)",
    params: [],
  });
}
```

### cropBatches
Returns detailed information about a specific crop batch by its ID.

```javascript
import { useReadContract } from "thirdweb/react";

export default function Component() {
  const { data, isPending } = useReadContract({
    contract,
    method: "function cropBatches(uint256) view returns (address farmerAddress, string productName, uint256 quantity, string qualityGrade, uint256 harvestDate, string farmLocation, uint256 basePricePerKg, string certificationNumber)",
    params: [batchId], // Replace with actual batch ID
  });
}
```

### getProcessingRequest
Returns the processing request details for a specific batch ID.

```javascript
import { useReadContract } from "thirdweb/react";

export default function Component() {
  const { data, isPending } = useReadContract({
    contract,
    method: "function getProcessingRequest(uint256 _batchId) view returns ((uint256 batchId, address traderAddress, uint256 proposedFinalPrice, bool isApproved, bool isRejected, uint256 requestTimestamp))",
    params: [_batchId],
  });
}
```

### getProductHistory
Returns the complete history and details of a processed product batch.

```javascript
import { useReadContract } from "thirdweb/react";

export default function Component() {
  const { data, isPending } = useReadContract({
    contract,
    method: "function getProductHistory(uint256 _batchId) view returns (((string farmerName, string traderName, string productName) names, (uint256 basePrice, uint256 finalPrice) prices, (uint256 harvestDate, uint256 packagingDate) dates, (string qualityGrade, string certificationNumber, string qrCodeId) quality))",
    params: [_batchId],
  });
}
```

### getTraderNameForRequest
Returns the trader name associated with a processing request for a specific batch.

```javascript
import { useReadContract } from "thirdweb/react";

export default function Component() {
  const { data, isPending } = useReadContract({
    contract,
    method: "function getTraderNameForRequest(uint256 _batchId) view returns (string)",
    params: [_batchId],
  });
}
```

### processedBatches
Returns information about a processed batch by its ID.

```javascript
import { useReadContract } from "thirdweb/react";

export default function Component() {
  const { data, isPending } = useReadContract({
    contract,
    method: "function processedBatches(uint256) view returns (address traderAddress, uint256 processingDate, uint256 packagingDate, string storageConditions, uint256 finalPricePerKg, string transportDetails, string qrCodeId)",
    params: [batchId], // Replace with actual batch ID
  });
}
```

### processingRequests
Returns processing request information by batch ID.

```javascript
import { useReadContract } from "thirdweb/react";

export default function Component() {
  const { data, isPending } = useReadContract({
    contract,
    method: "function processingRequests(uint256) view returns (uint256 batchId, address traderAddress, uint256 proposedFinalPrice, bool isApproved, bool isRejected, uint256 requestTimestamp)",
    params: [batchId], // Replace with actual batch ID
  });
}
```

### registrationContract
Returns the address of the registration contract.

```javascript
import { useReadContract } from "thirdweb/react";

export default function Component() {
  const { data, isPending } = useReadContract({
    contract,
    method: "function registrationContract() view returns (address)",
    params: [],
  });
}
```

## Write Functions

### addCropBatch
Allows farmers to add a new crop batch to the system.

```javascript
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";

export default function Component() {
  const { mutate: sendTransaction } = useSendTransaction();
  
  const onClick = () => {
    const transaction = prepareContractCall({
      contract,
      method: "function addCropBatch(string _productName, uint256 _quantity, string _qualityGrade, uint256 _harvestDate, string _farmLocation, uint256 _basePricePerKg, string _certificationNumber)",
      params: [
        _productName,
        _quantity,
        _qualityGrade,
        _harvestDate,
        _farmLocation,
        _basePricePerKg,
        _certificationNumber,
      ],
    });
    sendTransaction(transaction);
  };
}
```

### approveProcessing
Allows farmers to approve a trader's processing request for their crop batch.

```javascript
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";

export default function Component() {
  const { mutate: sendTransaction } = useSendTransaction();
  
  const onClick = () => {
    const transaction = prepareContractCall({
      contract,
      method: "function approveProcessing(uint256 _batchId)",
      params: [_batchId],
    });
    sendTransaction(transaction);
  };
}
```

### processBatch
Allows traders to process an approved crop batch with detailed information.

```javascript
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";

export default function Component() {
  const { mutate: sendTransaction } = useSendTransaction();
  
  const onClick = () => {
    const transaction = prepareContractCall({
      contract,
      method: "function processBatch(uint256 _batchId, uint256 _processingDate, uint256 _packagingDate, string _storageConditions, string _transportDetails, string _qrCodeId)",
      params: [
        _batchId,
        _processingDate,
        _packagingDate,
        _storageConditions,
        _transportDetails,
        _qrCodeId,
      ],
    });
    sendTransaction(transaction);
  };
}
```

### rejectProcessing
Allows farmers to reject a trader's processing request for their crop batch.

```javascript
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";

export default function Component() {
  const { mutate: sendTransaction } = useSendTransaction();
  
  const onClick = () => {
    const transaction = prepareContractCall({
      contract,
      method: "function rejectProcessing(uint256 _batchId)",
      params: [_batchId],
    });
    sendTransaction(transaction);
  };
}
```

### requestProcessing
Allows traders to request processing of a crop batch with a proposed final price.

```javascript
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";

export default function Component() {
  const { mutate: sendTransaction } = useSendTransaction();
  
  const onClick = () => {
    const transaction = prepareContractCall({
      contract,
      method: "function requestProcessing(uint256 _batchId, uint256 _proposedFinalPrice)",
      params: [_batchId, _proposedFinalPrice],
    });
    sendTransaction(transaction);
  };
}
```

## Usage Notes

1. **Contract Instance**: Make sure to import and initialize your contract instance before using any of these functions.

2. **Parameter Replacement**: Replace placeholder parameters (like `_batchId`, `_productName`, etc.) with actual values from your application state or user input.

3. **Error Handling**: Consider adding proper error handling and loading states when implementing these functions in your application.

4. **Event Listening**: Use the event listeners to update your UI in real-time when contract state changes occur.

5. **Gas Optimization**: Write functions require gas fees, so ensure users understand the cost implications.

## Contract Overview

This appears to be a supply chain management contract for agricultural products, featuring:

- **Farmers** can add crop batches with detailed information
- **Traders** can request to process crop batches with proposed prices
- **Farmers** can approve or reject processing requests
- **Traders** can process approved batches with packaging and transport details
- Complete traceability through batch history and QR codes
- Event-driven architecture for real-time updates