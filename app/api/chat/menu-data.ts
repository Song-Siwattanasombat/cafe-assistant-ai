export type MenuItem = {
  name: string;
  price: number;
  category: 'Hot Food' | 'Cold Food (Grab and Go)';
  allergens: string;
};

export type DailyMenu = {
  date: string;
  items: MenuItem[];
};

export const menuByDay: Record<string, DailyMenu> = {
  monday: {
    date: 'Monday, 7 September 2026',
    items: [
      { name: 'Rice with Butter Chicken Curry', price: 8.1, category: 'Hot Food', allergens: 'Milk' },
      { name: 'Vegan Tomato Pasta', price: 8.1, category: 'Hot Food', allergens: 'Gluten, wheat' },
      { name: 'Ham and Cheese Sandwich', price: 6, category: 'Cold Food (Grab and Go)', allergens: 'Gluten, wheat, milk, soy' },
      { name: 'Fruit Salad Cup', price: 5, category: 'Cold Food (Grab and Go)', allergens: 'None listed in the provided information' },
    ],
  },
  tuesday: {
    date: 'Tuesday, 8 September 2026',
    items: [
      { name: 'Beef Burger', price: 7.5, category: 'Hot Food', allergens: 'Gluten, wheat, egg, milk, sesame' },
      { name: 'Vegan Pesto Pasta', price: 8.1, category: 'Hot Food', allergens: 'Gluten, wheat' },
      { name: 'Chicken Salad Sandwich', price: 6, category: 'Cold Food (Grab and Go)', allergens: 'Gluten, wheat, egg' },
      { name: 'Fruit Salad Cup', price: 5, category: 'Cold Food (Grab and Go)', allergens: 'None listed in the provided information' },
    ],
  },
  wednesday: {
    date: 'Wednesday, 9 September 2026',
    items: [
      { name: 'Rice with Teriyaki Chicken', price: 8.1, category: 'Hot Food', allergens: 'Gluten, wheat, soy' },
      { name: 'Vegan Vegetable Pasta', price: 8.1, category: 'Hot Food', allergens: 'Gluten, wheat' },
      { name: 'Egg and Lettuce Sandwich', price: 6, category: 'Cold Food (Grab and Go)', allergens: 'Gluten, wheat, egg' },
      { name: 'Watermelon and Grape Cup', price: 5, category: 'Cold Food (Grab and Go)', allergens: 'None listed in the provided information' },
    ],
  },
  thursday: {
    date: 'Thursday, 10 September 2026',
    items: [
      { name: 'Roast Chicken and Potatoes', price: 8.1, category: 'Hot Food', allergens: 'Soy' },
      { name: 'Vegan Pumpkin Pasta', price: 8.1, category: 'Hot Food', allergens: 'Gluten, wheat' },
      { name: 'Tuna Sandwich', price: 6, category: 'Cold Food (Grab and Go)', allergens: 'Fish, egg, gluten, wheat' },
      { name: 'Fruit Salad Cup', price: 5, category: 'Cold Food (Grab and Go)', allergens: 'None listed in the provided information' },
    ],
  },
  friday: {
    date: 'Friday, 11 September 2026',
    items: [
      { name: 'Fish and Chips', price: 8.1, category: 'Hot Food', allergens: 'Fish, gluten, wheat, egg' },
      { name: 'Vegan Bolognese Pasta', price: 8.1, category: 'Hot Food', allergens: 'Gluten, wheat, soy' },
      { name: 'Ham and Cheese Sandwich', price: 6, category: 'Cold Food (Grab and Go)', allergens: 'Gluten, wheat, milk, soy' },
      { name: 'Fruit Salad Cup', price: 5, category: 'Cold Food (Grab and Go)', allergens: 'None listed in the provided information' },
    ],
  },
};
