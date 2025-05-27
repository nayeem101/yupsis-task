function toMilligrams(quantity) {
  const conversionRates = {
    tons: 1000000000,
    kilograms: 1000000,
    grams: 1000,
    milligrams: 1,
  };

  let totalMg = 0;
  for (const unit in quantity) {
    if (conversionRates[unit]) {
      totalMg += quantity[unit] * conversionRates[unit];
    }
  }

  return totalMg;
}

function fromMilligrams(totalMg) {
  const result = {
    tons: 0,
    kilograms: 0,
    grams: 0,
    milligrams: 0,
  };

  result.tons = Math.floor(totalMg / 1000000000);
  totalMg %= 1000000000;

  result.kilograms = Math.floor(totalMg / 1000000);
  totalMg %= 1000000;

  result.grams = Math.floor(totalMg / 1000);
  totalMg %= 1000;

  result.milligrams = totalMg;

  return result;
}

function updateStock(currentStock, transaction, operation) {
  let totalMg = toMilligrams(currentStock);

  const transactionMg = toMilligrams(transaction);

  if (operation.toLowerCase() === "sell") {
    totalMg -= transactionMg;

    if (totalMg < 0) {
      throw new Error("not enough stock");
    }
  } else if (operation.toLowerCase() === "purchase") {
    totalMg += transactionMg;
  } else {
    throw new Error("invalid operation. use 'sell' or 'purchase'");
  }

  return fromMilligrams(totalMg);
}

const initialStock = { tons: 1, kilograms: 0, grams: 0, milligrams: 0 };

const afterSale = updateStock(initialStock, { tons: 0, kilograms: 0, grams: 1, milligrams: 0 }, "sell");
console.log("after sale:", afterSale);

const afterPurchase = updateStock(afterSale, { tons: 0, kilograms: 0, grams: 1001, milligrams: 0 }, "purchase");
console.log("after purchase:", afterPurchase);
