## Documentation for the Food Delivery Tracking System Smart Contract

### Overview

This TypeScript smart contract implements a basic Food Delivery Tracking System on the Internet Computer blockchain using the `azle` library. The system allows for managing clients, food items, orders, and reviews.

### Entities

#### 1. Client

- **Fields:**
  - `id`: Unique identifier for the client.
  - `name`: Name of the client.
  - `address`: Address of the client.
  - `created_date`: Timestamp when the client was created.
  - `updated_at`: Optional timestamp for the last update.

#### 2. FoodItem

- **Fields:**
  - `id`: Unique identifier for the food item.
  - `name`: Name of the food item.
  - `description`: Description of the food item.
  - `price`: Price of the food item.
  - `created_date`: Timestamp when the food item was created.
  - `updated_at`: Optional timestamp for the last update.

#### 3. Order

- **Fields:**
  - `id`: Unique identifier for the order.
  - `client_id`: Identifier of the client placing the order.
  - `items`: List of food item IDs in the order.
  - `total_price`: Total price of the order.
  - `is_delivered`: Boolean indicating whether the order is delivered.
  - `created_date`: Timestamp when the order was created.
  - `updated_at`: Optional timestamp for the last update.

#### 4. Review

- **Fields:**
  - `id`: Unique identifier for the review.
  - `order_id`: Identifier of the order being reviewed.
  - `rating`: Rating given in the review.
  - `comment`: Comment provided in the review.
  - `created_date`: Timestamp when the review was created.
  - `updated_at`: Optional timestamp for the last update.

#### 5. FoodPayload

- **Fields:**
  - `name`: Name of the food item.
  - `description`: Description of the food item.
  - `price`: Price of the food item.

#### 6. OrderPayload

- **Fields:**
  - `client_id`: Identifier of the client placing the order.
  - `items`: List of food item IDs in the order.

#### 7. ReviewPayload

- **Fields:**
  - `order_id`: Identifier of the order being reviewed.
  - `rating`: Rating given in the review.
  - `comment`: Comment provided in the review.

#### 8. DeliveryResponse

- **Fields:**
  - `msg`: Message indicating the result of an order placement.
  - `total_price`: Total price of the order.

### Functions

#### Initialization

- **Function: `initFoodDeliverySystem`**
  - Initializes the food delivery system by creating a default client if the system is not already initialized.
  - Returns the ID of the default client.

#### Query Functions

- **Function: `getClients`**
  - Retrieves information about all clients.
  - Returns a `Result` with a vector of `Client` records or an error message.

- **Function: `getFoodItems`**
  - Retrieves information about all food items.
  - Returns a `Result` with a vector of `FoodItem` records or an error message.

- **Function: `getOrders`**
  - Retrieves information about all orders.
  - Returns a `Result` with a vector of `Order` records or an error message.

- **Function: `getReviews`**
  - Retrieves information about all reviews.
  - Returns a `Result` with a vector of `Review` records or an error message.

#### Update Functions

- **Function: `addClient`**
  - Adds a new client with the provided name and address.
  - Returns the ID of the newly added client.

- **Function: `addFoodItem`**
  - Adds a new food item with the provided payload.
  - Returns the ID of the newly added food item.

- **Function: `placeOrder`**
  - Places a new order for a client with the provided payload.
  - Returns a `DeliveryResponse` indicating the success of the order placement.

- **Function: `addReview`**
  - Adds a new review for an order with the provided payload.
  - Returns the ID of the newly added review.

#### Update Functions (with Data Modification)

- **Function: `updateClient`**
  - Updates the information of an existing client with the provided ID.
  - Returns the ID of the updated client or an error message if the client is not found.

- **Function: `updateFoodItem`**
  - Updates the information of an existing food item with the provided ID.
  - Returns the ID of the updated food item or an error message if the food item is not found.

- **Function: `updateOrder`**
  - Updates the information of an existing order with the provided ID.
  - Returns the ID of the updated order or an error message if the order is not found.

- **Function: `updateReview`**
  - Updates the information of an existing review with the provided ID.
  - Returns the ID of the updated review or an error message if the review is not found.

#### Deletion Functions

- **Function: `deleteClient`**
  - Deletes an existing client with the provided ID.
  - Returns a success message or an error message if the client is not found.

- **Function: `deleteFoodItem`**
  - Deletes an existing food item with the provided ID.
  - Returns a success message or an error message if the food item is not found.

- **Function: `deleteOrder`**
  - Deletes an existing order with the provided ID.
  - Returns a success message or an error message if the order is not found.

- **Function: `deleteReview`**
  - Deletes an existing review with the provided ID.
  - Returns a success message or an error message if the review is not found.

#### Mocking for Testing

- **Mocking: `globalThis.crypto`**
  - Mocks

 the 'crypto' object for testing purposes.

## installation

```bash
git clone https://github.com/dev-0015/Food-Delivery-Tracking-System-Smart-Contract-.git
cd Food-Delivery-Tracking-System-Smart-Contract-
npm install
dfx start --background --clean
dfx deploy
```