function validateData(data) {
  // Check for the main categories
  if (
    !data ||
    !data.vending ||
    !data.changer ||
    !data.coinBox ||
    !data.billStack
  ) {
    return false;
  }

  // Validate 'vending' object details
  const { vending } = data;
  if (!vending.products || vending.freeVends === undefined) {
    return false;
  }
  // Validate all products under 'vending'
  const products = vending.products;
  if (!products.A || !products.B || !products.C) {
    return false;
  }
  // Detailed validation for each product
  if (
    !validateProduct(products.A) ||
    !validateProduct(products.B) ||
    !validateProduct(products.C)
  ) {
    return false;
  }

  // Validate 'changer' object details
  const { changer } = data;
  if (
    changer.nickels === undefined ||
    changer.dimes === undefined ||
    changer.quarters === undefined ||
    changer.totalCashValue === undefined
  ) {
    return false;
  }

  // Validate 'coinBox' and 'billStack' objects
  if (data.coinBox.total === undefined || data.billStack.total === undefined) {
    return false;
  }

  return true; // If all checks pass
}

function validateProduct(product) {
  // Check required fields in a product
  return (
    product.count !== undefined &&
    product.price !== undefined &&
    product.flow !== undefined
  );
}

module.exports = validateData;
