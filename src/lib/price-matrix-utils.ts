import { centavosToReaisNumber, reaisToCentavos } from "@/lib/formatters";

export type MatrixState = Record<string, string>;

export const STRUCTURE_CHECKED = "1";

export const makeMatrixKey = (supplierId: string, productId: string) =>
  `${supplierId}:${productId}`;

export const parseMatrixKey = (key: string) => {
  const [supplierId, productId] = key.split(":");
  return { supplierId, productId };
};

export const filterCatalogByType = <
  TProduct extends { id: string; priceSearchTypeId: string },
  TSupplier extends { id: string; priceSearchTypeId: string },
>(
  products: TProduct[],
  suppliers: TSupplier[],
  typeId: string,
) => ({
  products: products.filter((product) => product.priceSearchTypeId === typeId),
  suppliers: suppliers.filter(
    (supplier) => supplier.priceSearchTypeId === typeId,
  ),
});

export const priceSearchItemsToMatrix = (
  items: Array<{
    productId: string;
    supplierId: string;
    price: number;
  }>,
): MatrixState => {
  const matrix: MatrixState = {};

  items.forEach((item) => {
    const key = makeMatrixKey(item.supplierId, item.productId);
    matrix[key] = centavosToReaisNumber(item.price).toFixed(2).replace(".", ",");
  });

  return matrix;
};

export const matrixToPriceSearchItems = (matrix: MatrixState) => {
  const items: Array<{
    productId: string;
    supplierId: string;
    price: number;
  }> = [];

  Object.entries(matrix).forEach(([key, value]) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const price = reaisToCentavos(trimmed);
    if (price <= 0) return;

    const { supplierId, productId } = parseMatrixKey(key);
    if (!supplierId || !productId) return;

    items.push({ productId, supplierId, price });
  });

  return items;
};

export const templateItemsToMatrix = (
  items: Array<{
    productId: string;
    supplierId: string;
  }>,
): MatrixState => {
  const matrix: MatrixState = {};

  items.forEach((item) => {
    const key = makeMatrixKey(item.supplierId, item.productId);
    matrix[key] = STRUCTURE_CHECKED;
  });

  return matrix;
};

export const matrixToTemplateItems = (matrix: MatrixState) => {
  const items: Array<{
    productId: string;
    supplierId: string;
    sortOrder: number;
  }> = [];

  Object.entries(matrix).forEach(([key, value]) => {
    if (value !== STRUCTURE_CHECKED) return;

    const { supplierId, productId } = parseMatrixKey(key);
    if (!supplierId || !productId) return;

    items.push({
      productId,
      supplierId,
      sortOrder: items.length,
    });
  });

  return items;
};

export const templateItemsToHighlightedKeys = (
  items: Array<{
    productId: string;
    supplierId: string;
  }>,
) => new Set(items.map((item) => makeMatrixKey(item.supplierId, item.productId)));

export const hasMatrixData = (matrix: MatrixState) =>
  Object.values(matrix).some((value) => value.trim().length > 0);
