-- CreateTable
CREATE TABLE "MealRecord" (
    "id" SERIAL NOT NULL,
    "food_name" TEXT NOT NULL,
    "meal_date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MealRecord_food_name_key" ON "MealRecord"("food_name");
