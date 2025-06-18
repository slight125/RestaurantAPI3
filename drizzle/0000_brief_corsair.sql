CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"street_address_1" varchar(255) NOT NULL,
	"street_address_2" varchar(255),
	"city_id" integer NOT NULL,
	"zip_code" varchar(10) NOT NULL,
	"delivery_instructions" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"state_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"order_id" integer NOT NULL,
	"comment_text" text NOT NULL,
	"is_complaint" boolean DEFAULT false,
	"is_praise" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"car_make" varchar(50),
	"car_model" varchar(50),
	"car_year" integer,
	"car_color" varchar(30),
	"car_plate_number" varchar(20),
	"online" boolean DEFAULT false,
	"delivering" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"ingredients" text,
	"price" numeric(10, 2) NOT NULL,
	"image_url" varchar(500),
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"menu_item_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"item_price" numeric(10, 2) NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"status_catalog_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"driver_id" integer,
	"delivery_address_id" integer NOT NULL,
	"estimated_delivery_time" timestamp,
	"actual_delivery_time" timestamp,
	"price" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0.00',
	"final_price" numeric(10, 2) NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "restaurant_owners" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"restaurant_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"street_address" varchar(255) NOT NULL,
	"zip_code" varchar(10) NOT NULL,
	"city_id" integer NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"description" text,
	"image_url" varchar(500),
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "states_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "status_catalog" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "status_catalog_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"contact_phone" varchar(20),
	"phone_verified" boolean DEFAULT false,
	"email_verified" boolean DEFAULT false,
	"confirmation_code" varchar(6),
	"password_reset_token" varchar(255),
	"password_reset_expires" timestamp,
	"role" varchar(20) DEFAULT 'customer',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_menu_items" ADD CONSTRAINT "order_menu_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_menu_items" ADD CONSTRAINT "order_menu_items_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status" ADD CONSTRAINT "order_status_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status" ADD CONSTRAINT "order_status_status_catalog_id_status_catalog_id_fk" FOREIGN KEY ("status_catalog_id") REFERENCES "public"."status_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_address_id_addresses_id_fk" FOREIGN KEY ("delivery_address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_owners" ADD CONSTRAINT "restaurant_owners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_owners" ADD CONSTRAINT "restaurant_owners_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;