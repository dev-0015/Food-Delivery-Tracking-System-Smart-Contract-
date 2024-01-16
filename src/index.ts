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
}>;

type Order = Record<{
  id: string;
  client_id: string;
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

// Creating instances of StableBTreeMap for each entity type
const clientStorage = new StableBTreeMap<string, Client>(0, 44, 512);
const foodItemStorage = new StableBTreeMap<string, FoodItem>(1, 44, 512);
const orderStorage = new StableBTreeMap<string, Order>(2, 44, 512);
const reviewStorage = new StableBTreeMap<string, Review>(3, 44, 512);

// Function to initialize the food delivery system
$update;
export function initFoodDeliverySystem(): string {
  if (!clientStorage.isEmpty() || !foodItemStorage.isEmpty() || !orderStorage.isEmpty() || !reviewStorage.isEmpty()) {
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

// Function to add a new food item
$update;
export function addFoodItem(payload: FoodPayload): string {
  const foodItem = {
    id: uuidv4(),
    name: payload.name,
    description: payload.description,
    price: payload.price,
    created_date: ic.time(),
    updated_at: Opt.None,
  };
  foodItemStorage.insert(foodItem.id, foodItem);
  return foodItem.id;
}

// Function to place a new order
$update;
export function placeOrder(payload: OrderPayload): DeliveryResponse {
  const client = match(clientStorage.get(payload.client_id), {
    Some: (client) => client,
    None: () => null,
  });

  if (!client) {
    return {
      msg: "Invalid client ID",
      total_price: 0,
    };
  }

  const order = {
    id: uuidv4(),
    client_id: client.id,
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
      None: () => null,
    });
    if (foodItem) {
      total += parseFloat(foodItem.price);
    }
  });
  return total.toString();
}

// Function to update client information
$update;
export function updateClient(id: string, name: string, address: string): string {
  const existingClient = match(clientStorage.get(id), {
    Some: (client) => client,
    None: () => null,
  });

  if (existingClient) {
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
    None: () => null,
  });

if (existingFoodItem) {
    existingFoodItem.name = payload.name;
    existingFoodItem.description = payload.description;
    existingFoodItem.price = payload.price;
    existingFoodItem.updated_at = Opt.Some(ic.time());
    foodItemStorage.insert(existingFoodItem.id, existingFoodItem);
    return existingFoodItem.id;
  }

  return "Food item not found";
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
    None: () => null,
  });

  if (existingOrder) {
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
    None: () => null,
  });

  if (existingReview) {
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
  return deleteEntity(id, clientStorage);
}

// Function to delete a food item
$update;
export function deleteFoodItem(id: string): string {
  return deleteEntity(id, foodItemStorage);
}

// Function to delete an order
$update;
export function deleteOrder(id: string): string {
  return deleteEntity(id, orderStorage);
}

// Function to delete a review
$update;
export function deleteReview(id: string): string {
  return deleteEntity(id, reviewStorage);
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
