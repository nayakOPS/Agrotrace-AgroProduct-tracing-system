This document provides a comprehensive overview of the deployed smart contract Registration and their React SDK implementations using thirdweb.

## Registration Contract

### Write Functions

#### 1. registerAgroTrader
```typescript
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";

export default function Component() {
  const { mutate: sendTransaction } = useSendTransaction();

  const onClick = () => {
    const transaction = prepareContractCall({
      contract,
      method: "function registerAgroTrader(string _businessName, string _email, string _phoneNumber, string _panVatNumber, string _warehouseLocation)",
      params: [
        _businessName,
        _email,
        _phoneNumber,
        _panVatNumber,
        _warehouseLocation,
      ],
    });
    sendTransaction(transaction);
  };
}
```

#### 2. registerFarmer
```typescript
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";

export default function Component() {
  const { mutate: sendTransaction } = useSendTransaction();

  const onClick = () => {
    const transaction = prepareContractCall({
      contract,
      method: "function registerFarmer(string _name, string _addressDetails, string _email, string _phoneNumber, string _citizenshipId, string _photoLink, string _location)",
      params: [
        _name,
        _addressDetails,
        _email,
        _phoneNumber,
        _citizenshipId,
        _photoLink,
        _location,
      ],
    });
    sendTransaction(transaction);
  };
}
```

### Read Functions

#### 1. getAgroTraderDetails
```typescript
import { useReadContract } from "thirdweb/react";

export default function Component() {
  const { data, isPending } = useReadContract({
    contract,
    method: "function getAgroTraderDetails(address _wallet) view returns ((string businessName, string email, string phoneNumber, string panVatNumber, string warehouseLocation))",
    params: [_wallet],
  });
}
```

#### 2. getFarmerDetails
```typescript
import { useReadContract } from "thirdweb/react";

export default function Component() {
  const { data, isPending } = useReadContract({
    contract,
    method: "function getFarmerDetails(address _wallet) view returns ((string name, string addressDetails, string email, string phoneNumber, string citizenshipId, string photoLink, string location))",
    params: [_wallet],
  });
}
```

#### 3. getRole
```typescript
import { useReadContract } from "thirdweb/react";

export default function Component() {
  const { data, isPending } = useReadContract({
    contract,
    method: "function getRole(address _wallet) view returns (string)",
    params: [_wallet],
  });
}
```

### Events

#### 1. AgroTraderRegistered
```typescript
import { prepareEvent } from "thirdweb";
import { useContractEvents } from "thirdweb/react";

const preparedEvent = prepareEvent({
  signature: "event AgroTraderRegistered(address indexed agroTrader, string businessName)",
});

export default function Component() {
  const { data: event } = useContractEvents({
    contract,
    events: [preparedEvent],
  });
}
```

#### 2. FarmerRegistered
```typescript
import { prepareEvent } from "thirdweb";
import { useContractEvents } from "thirdweb/react";

const preparedEvent = prepareEvent({
  signature: "event FarmerRegistered(address indexed farmer, string name)",
});

export default function Component() {
  const { data: event } = useContractEvents({
    contract,
    events: [preparedEvent],
  });
}
``