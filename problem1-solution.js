//Problem 1: Mojo and Mutki Exchange Calculation
// Solution
function calculateMaxMojosConsumed(initialMojos) {
  let mojos = initialMojos;
  let mutkis = 0;
  let totalMojosConsumed = 0;

  while (mojos > 0 || mutkis >= 3) {
    while (mojos > 0) {
      mojos--;
      mutkis++;
      totalMojosConsumed++;
    }

    const exchangeableSets = Math.floor(mutkis / 3);
    if (exchangeableSets > 0) {
      mojos += exchangeableSets;
      mutkis -= exchangeableSets * 3;
    } else {
      break;
    }
  }

  return totalMojosConsumed;
}

console.log(calculateMaxMojosConsumed(10));
console.log(calculateMaxMojosConsumed(20));
console.log(calculateMaxMojosConsumed(100));
console.log(calculateMaxMojosConsumed(50));
