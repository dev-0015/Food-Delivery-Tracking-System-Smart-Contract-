// Importing necessary modules from the 'azle' library and 'uuid' library
import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt, Principal } from 'azle';
import { v4 as uuidv4 } from "uuid";

// Defining record types for different entities
type Client = Record<{
  id: string;
  name: string;
  address: string;
  created_date: nat64;
  updated_at: Opt<nat64>;
}>;

type FoodItem = Record<{
  id: string;
  name: string;
  description: string;
  price: string;
  created_date: nat64;
  updated_at: Opt<nat64>;
  inventory: number;
}>;

type Order = Record<{
  id: string;
  client_id: string;
  driver_id: Opt<string>; // Updated to include driver_id
  items: Vec<string>;
  total_price: string;
  is_delivered: boolean;
  created_date: nat64;
  updated_at: Opt<nat64>;
}>;

type Review = Record<{
  id: string;
  order_id: string;
  rating: number;
  comment: string;
  created_date: nat64;
  updated_at: Opt<nat64>;
}>;

type Driver = Record<{
  id: string;
  name: string;
  contact: string;
  created_date: nat64;
  updated_at: Opt<nat64>;
}>;

type FoodPayload = Record<{
  name: string;
  description: string;
  price: string;
}>;

type OrderPayload = Record<{
  client_id: string;
  items: Vec<string>;
}>;

type ReviewPayload = Record<{
  order_id: string;
  rating: number;
  comment: string;
}>;

type DeliveryResponse = Record<{
  msg: string;
  total_price: number;
}>;

// New Structure for Inventory
type Inventory = Record<{
  food_item_id: string;
  quantity: number;
  created_date: nat64;
  updated_at: Opt<nat64>;
}>;

// New Structure for DeliveryAddress
type DeliveryAddress = Record<{
  id: string;
  client_id: string;
  street: string;
  city: string;
  postal_code: string;
  created_date: nat64;
  updated_at: Opt<nat64>;
}>;

// Creating instances of StableBTreeMap for each entity type
const clientStorage = new StableBTreeMap<string, Client>(0, 44, 512);
const foodItemStorage = new StableBTreeMap<string, FoodItem>(1, 44, 512);
const orderStorage = new StableBTreeMap<string, Order>(2, 44, 512);
const reviewStorage = new StableBTreeMap<string, Review>(3, 44, 512);
const driverStorage = new StableBTreeMap<string, Driver>(4, 44, 512);
const inventoryStorage = new StableBTreeMap<string, Inventory>(6, 44, 512);
const deliveryAddressStorage = new StableBTreeMap<string, DeliveryAddress>(5, 44, 512);

// Function to initialize the food delivery system
$update;
export function initFoodDeliverySystem(): string {
  if (!clientStorage.isEmpty() || !foodItemStorage.isEmpty() || !orderStorage.isEmpty() || !reviewStorage.isEmpty() || !driverStorage.isEmpty()) {
    return `Food delivery system has already been initialized`;
  }

  // Initialize default client
  const client = {
    id: uuidv4(),
    name: "Default Client",
    address: "Default Address",
    created_date: ic.time(),
    updated_at: Opt.None,
  };
  clientStorage.insert(client.id, client);

  return client.id;
}

$query;
// Function to get information about clients
export function getClients(): Result<Vec<Client>, string> {
  const clients = clientStorage.values();
  if (clients.length === 0) {
    return Result.Err("No clients found");
  }
  return Result.Ok(clients);
}

$query;
// Function to get information about food items
export function getFoodItems(): Result<Vec<FoodItem>, string> {
  const foodItems = foodItemStorage.values();
  if (foodItems.length === 0) {
    return Result.Err("No food items found");
  }
  return Result.Ok(foodItems);
}

// Function to get information about drivers
$query;
export function getDrivers(): Result<Vec<Driver>, string> {
  const drivers = driverStorage.values();
  if (drivers.length === 0) {
    return Result.Err("No drivers found");
  }
  return Result.Ok(drivers);
}

// Function to add a new client
$update;
export function addClient(name: string, address: string): string {
  const client = {
    id: uuidv4(),
    name: name,
    address: address,
    created_date: ic.time(),
    updated_at: Opt.None,
  };
  clientStorage.insert(client.id, client);
  return client.id;
}

// Function to add a new food item with initial inventory
$update;
export function addFoodItemWithInventory(payload: FoodPayload, initialInventory: number): Result<string, string> {
  if (!payload.name || !payload.description || !payload.price) {
    return Result.Err("Please provide valid values for name, description, and price");
  }

  const foodItem = {
    id: uuidv4(),
    name: payload.name,
    description: payload.description,
    price: payload.price,
    created_date: ic.time(),
    updated_at: Opt.None,
    inventory: initialInventory,
  };
  foodItemStorage.insert(foodItem.id, foodItem);

  // Add inventory entry
  const inventory = {
    food_item_id: foodItem.id,
    quantity: initialInventory,
    created_date: ic.time(),
    updated_at: Opt.None,
  };
  inventoryStorage.insert(inventory.food_item_id, inventory);

  return Result.Ok(foodItem.id);
}

// Function to add a new driver
$update;
export function addDriver(name: string, contact: string): string {
  const driver = {
    id: uuidv4(),
    name: name,
    contact: contact,
    created_date: ic.time(),
    updated_at: Opt.None,
  };
  driverStorage.insert(driver.id, driver);
  return driver.id;
}

// Function to add a new delivery address
$update;
export function addDeliveryAddress(clientId: string, street: string, city: string, postalCode: string): Result<string, string> {
  if (!street || !city || !postalCode) {
    return Result.Err("Please provide valid values for street, city, and postal code");
  }

  const deliveryAddress = {
    id: uuidv4(),
    client_id: clientId,
    street: street,
    city: city,
    postal_code: postalCode,
    created_date: ic.time(),
    updated_at: Opt.None,
  };
  deliveryAddressStorage.insert(deliveryAddress.id, deliveryAddress);
  return Result.Ok(deliveryAddress.id);
}

// Function to get delivery addresses for a client
$query;
export function getDeliveryAddresses(clientId: string): Result<Vec<DeliveryAddress>, string> {
  const addresses = deliveryAddressStorage.values().filter((address) => address.client_id === clientId);
  if (addresses.length === 0) {
    return Result.Err("No delivery addresses found for the client");
  }
  return Result.Ok(addresses);
}

// Function to place a new order
$update;
export function placeOrder(payload: OrderPayload): DeliveryResponse {
  const client = match(clientStorage.get(payload.client_id), {
    Some: (client) => client,
    None: () => ({} as unknown as Client),
  });

  if (!client.id) {
    return {
      msg: "Invalid client ID",
      total_price: 0,
    };
  }

  const order = {
    id: uuidv4(),
    client_id: client.id,
    driver_id: Opt.None, // Default value for driver_id
    items: payload.items,
    total_price: calculateTotalPrice(payload.items),
    is_delivered: false,
    created_date: ic.time(),
    updated_at: Opt.None,
  };
  orderStorage.insert(order.id, order);

  return {
    msg: `Order placed successfully. Total Price: $${order.total_price}`,
    total_price: parseFloat(order.total_price),
  };
}

// Function to assign a driver to an order
$update;
export function assignDriver(orderId: string, driverId: string): string {
  const existingOrder = match(orderStorage.get(orderId), {
    Some: (order) => order,
    None: () => ({} as unknown as Order),
  });

  if (existingOrder.id) {
    existingOrder.driver_id = Opt.Some(driverId);
    existingOrder.updated_at = Opt.Some(ic.time());
    orderStorage.insert(existingOrder.id, existingOrder);
    return existingOrder.id;
  }

  return "Order not found";
}

// Function to add a review for an order
$update;
export function addReview(payload: ReviewPayload): string {
  const review = {
    id: uuidv4(),
    order_id: payload.order_id,
    rating: payload.rating,
    comment: payload.comment,
    created_date: ic.time(),
    updated_at: Opt.None,
  };
  reviewStorage.insert(review.id, review);
  return review.id;
}

// Function to calculate the total price of an order
function calculateTotalPrice(items: Vec<string>): string {
  let total = 0;
  items.forEach((itemId) => {
    const foodItem = match(foodItemStorage.get(itemId), {
      Some: (item) => item,
      None: () => ({} as unknown as FoodItem),
    });
    total += parseFloat(foodItem.price);
  });
  return total.toString();
}

// Function to update client information
$update;
export function updateClient(id: string, name: string, address: string): string {
  const existingClient = match(clientStorage.get(id), {
    Some: (client) => client,
    None: () => ({} as unknown as Client),
  });

  if (existingClient.id) {
    existingClient.name = name;
    existingClient.address = address;
    existingClient.updated_at = Opt.Some(ic.time());
    clientStorage.insert(existingClient.id, existingClient);
    return existingClient.id;
  }

  return "Client not found";
}

// Function to update food item information
$update;
export function updateFoodItem(id: string, payload: FoodPayload): string {
  const existingFoodItem = match(foodItemStorage.get(id), {
    Some: (foodItem) => foodItem,
    None: () => ({} as unknown as FoodItem),
  });

  if (existingFoodItem.id) {
    existingFoodItem.name = payload.name;
    existingFoodItem.description = payload.description;
    existingFoodItem.price = payload.price;
    existingFoodItem.updated_at = Opt.Some(ic.time());
    foodItemStorage.insert(existingFoodItem.id, existingFoodItem);
    return existingFoodItem.id;
  }

  return "Food item not found";
}

// Function to update driver information
$update;
export function updateDriver(id: string, name: string, contact: string): string {
  const existingDriver = match(driverStorage.get(id), {
    Some: (driver) => driver,
    None: () => ({} as unknown as Driver),
  });

  if (existingDriver.id) {
    existingDriver.name = name;
    existingDriver.contact = contact;
    existingDriver.updated_at = Opt.Some(ic.time());
    driverStorage.insert(existingDriver.id, existingDriver);
    return existingDriver.id;
  }

  return "Driver not found";
}

// Function to get information about orders
$query;
export function getOrders(): Result<Vec<Order>, string> {
  const orders = orderStorage.values();
  if (orders.length === 0) {
    return Result.Err("No orders found");
  }
  return Result.Ok(orders);
}

// Function to get information about reviews
$query;
export function getReviews(): Result<Vec<Review>, string> {
  const reviews = reviewStorage.values();
  if (reviews.length === 0) {
    return Result.Err("No reviews found");
  }
  return Result.Ok(reviews);
}

// Function to update order information
$update;
export function updateOrder(id: string, items: Vec<string>): string {
  const existingOrder = match(orderStorage.get(id), {
    Some: (order) => order,
    None: () => ({} as unknown as Order),
  });

  if (existingOrder.id) {
    existingOrder.items = items;
    existingOrder.total_price = calculateTotalPrice(items);
    existingOrder.updated_at = Opt.Some(ic.time());
    orderStorage.insert(existingOrder.id, existingOrder);
    return existingOrder.id;
  }

  return "Order not found";
}

// Function to update review information
$update;
export function updateReview(id: string, rating: number, comment: string): string {
  const existingReview = match(reviewStorage.get(id), {
    Some: (review) => review,
    None: () => ({} as unknown as Review),
  });

  if (existingReview.id) {
    existingReview.rating = rating;
    existingReview.comment = comment;
    existingReview.updated_at = Opt.Some(ic.time());
    reviewStorage.insert(existingReview.id, existingReview);
    return existingReview.id;
  }

  return "Review not found";
}

// Function to delete a client
$update;
export function deleteClient(id: string): string {
  const existingClient = match(clientStorage.get(id), {
    Some: (client) => client,
    None: () => ({} as unknown as Client),
  });

  if (existingClient.id) {
    clientStorage.remove(id);
    return `Client with ID: ${id} removed successfully`;
  }

  return "Client not found";
}

// Function to delete a food item
$update;
export function deleteFoodItem(id: string): string {
  const existingFoodItem = match(foodItemStorage.get(id), {
    Some: (foodItem) => foodItem,
    None: () => ({} as unknown as FoodItem),
  });

  if (existingFoodItem.id) {
    foodItemStorage.remove(id);
    return `Food item with ID: ${id} removed successfully`;
  }

  return "Food item not found";
}

// Function to delete an order
$update;
export function deleteOrder(id: string): string {
  const existingOrder = match(orderStorage.get(id), {
    Some: (order) => order,
    None: () => ({} as unknown as Order),
  });

  if (existingOrder.id) {
    orderStorage.remove(id);
    return `Order with ID: ${id} removed successfully`;
  }

  return "Order not found";
}

// Function to delete a review
$update;
export function deleteReview(id: string): string {
  const existingReview = match(reviewStorage.get(id), {
    Some: (review) => review,
    None: () => ({} as unknown as Review),
  });

  if (existingReview.id) {
    reviewStorage.remove(id);
    return `Review with ID: ${id} removed successfully`;
  }

  return "Review not found";
}

// Function to delete a driver
$update;
export function deleteDriver(id: string): string {
  const existingDriver = match(driverStorage.get(id), {
    Some: (driver) => driver,
    None: () => ({} as unknown as Driver),
  });

  if (existingDriver.id) {
    driverStorage.remove(id);
    return `Driver with ID: ${id} removed successfully`;
  }

  return "Driver not found";
}

// Function to update delivery address information
$update;
export function updateDeliveryAddress(id: string, street: string, city: string, postalCode: string): Result<string, string> {
  const existingAddress = match(deliveryAddressStorage.get(id), {
    Some: (address) => address,
    None: () => ({} as unknown as DeliveryAddress),
  });

  if (!existingAddress.id) {
    return Result.Err("Delivery address not found");
  }

  if (!street || !city || !postalCode) {
    return Result.Err("Please provide valid values for street, city, and postal code");
  }

  existingAddress.street = street;
  existingAddress.city = city;
  existingAddress.postal_code = postalCode;
  existingAddress.updated_at = Opt.Some(ic.time());

  deliveryAddressStorage.insert(existingAddress.id, existingAddress);
  return Result.Ok(existingAddress.id);
}

// Function to get information about inventory
$query;
export function getInventory(): Result<Vec<Inventory>, string> {
  const inventory = inventoryStorage.values();
  if (inventory.length === 0) {
    return Result.Err("No inventory found");
  }
  return Result.Ok(inventory);
}

// Function to update inventory
$update;
export function updateInventory(foodItemId: string, quantity: number): Result<string, string> {
  const existingInventory = match(inventoryStorage.get(foodItemId), {
    Some: (inv) => inv,
    None: () => ({} as unknown as Inventory),
  });

  if (!existingInventory.food_item_id) {
    return Result.Err("Inventory not found");
  }

  existingInventory.quantity = quantity;
  existingInventory.updated_at = Opt.Some(ic.time());

  inventoryStorage.insert(existingInventory.food_item_id, existingInventory);
  return Result.Ok(existingInventory.food_item_id);
}

// Mocking the 'crypto' object for testing purposes
globalThis.crypto = {
  // @ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }

    return array;
  },
};
