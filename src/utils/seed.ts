import { db } from '../models/db';
import { 
  states, 
  cities, 
  categories, 
  statusCatalog 
} from '../models/schema';

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Seed states
    const stateData = [
      { name: 'California', code: 'CA' },
      { name: 'New York', code: 'NY' },
      { name: 'Texas', code: 'TX' },
      { name: 'Florida', code: 'FL' },
      { name: 'Illinois', code: 'IL' },
    ];

    const insertedStates = await db.insert(states).values(stateData).returning();
    console.log(`Seeded ${insertedStates.length} states`);

    // Seed cities
    const cityData = [
      { name: 'Los Angeles', stateId: insertedStates[0].id },
      { name: 'San Francisco', stateId: insertedStates[0].id },
      { name: 'New York City', stateId: insertedStates[1].id },
      { name: 'Buffalo', stateId: insertedStates[1].id },
      { name: 'Houston', stateId: insertedStates[2].id },
      { name: 'Dallas', stateId: insertedStates[2].id },
      { name: 'Miami', stateId: insertedStates[3].id },
      { name: 'Orlando', stateId: insertedStates[3].id },
      { name: 'Chicago', stateId: insertedStates[4].id },
    ];

    const insertedCities = await db.insert(cities).values(cityData).returning();
    console.log(`Seeded ${insertedCities.length} cities`);

    // Seed categories
    const categoryData = [
      { name: 'Appetizers' },
      { name: 'Main Courses' },
      { name: 'Desserts' },
      { name: 'Beverages' },
      { name: 'Salads' },
      { name: 'Soups' },
      { name: 'Pizza' },
      { name: 'Burgers' },
      { name: 'Pasta' },
      { name: 'Seafood' },
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`Seeded ${insertedCategories.length} categories`);

    // Seed status catalog
    const statusData = [
      { name: 'Pending', description: 'Order has been placed and is awaiting confirmation' },
      { name: 'Confirmed', description: 'Order has been confirmed by the restaurant' },
      { name: 'Preparing', description: 'Restaurant is preparing the order' },
      { name: 'Ready for Pickup', description: 'Order is ready for driver pickup' },
      { name: 'Picked Up', description: 'Driver has picked up the order' },
      { name: 'In Transit', description: 'Order is on the way to customer' },
      { name: 'Delivered', description: 'Order has been delivered to customer' },
      { name: 'Cancelled', description: 'Order has been cancelled' },
    ];

    const insertedStatuses = await db.insert(statusCatalog).values(statusData).returning();
    console.log(`Seeded ${insertedStatuses.length} status catalog entries`);

    console.log('Database seeding completed successfully!');
    return {
      states: insertedStates,
      cities: insertedCities,
      categories: insertedCategories,
      statuses: insertedStatuses,
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding script failed:', error);
      process.exit(1);
    });
}

