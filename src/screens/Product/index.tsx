import { useState, useEffect } from "react";

import Button from "../../components/Button/Button";

import { useCart, useProducts } from "../../context";

import { formatPrice } from "../../utils";

import { useNavigate, useParams } from "react-router";

import Selector from "../../components/Selector/Selector";

import type { Product } from "../../types";

import withForm from "../../components/withForm";

import RadioGroup from "../../components/RadioButton/RadioGroup";

const EnhancedRadioGroup = withForm(RadioGroup);

const EnhancedSelector = withForm(Selector);

export default function Product() {
  const navigate = useNavigate();

  const { id } = useParams();

  const { selectedProduct, products, setSelectedProduct } = useProducts();

  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);

  const [selectedColor, setSelectedColor] = useState(
    selectedProduct?.colors?.[0],
  );

  const [selectedSize, setSelectedSize] = useState(selectedProduct?.sizes?.[0]);

  const [product, setProduct] = useState<Product | null>(selectedProduct);

  useEffect(() => {
    if (!selectedProduct && id) {
      // Primeiro tenta encontrar o produto na lista já carregada
      const foundProduct = products.find((p) => p.id === Number(id));

      if (foundProduct) {
        setProduct(foundProduct);
        setSelectedProduct(foundProduct);
      } else {
        // Busca os produtos diretamente no JSONBin
        fetch("https://api.jsonbin.io/v3/b/6ac77ed0ac6210605a1f4c96/latest")
          .then((res) => {
            if (!res.ok) {
              throw new Error("Erro ao buscar produtos");
            }

            return res.json();
          })
          .then((data) => {
            // No JSONBin os dados ficam dentro de "record"
            const productsFromJsonBin: Product[] = data.record.products;

            // Procura o produto pelo ID da URL
            const foundProduct = productsFromJsonBin.find(
              (p) => p.id === Number(id),
            );

            if (foundProduct) {
              setProduct(foundProduct);
              setSelectedProduct(foundProduct);
            } else {
              setProduct(null);
            }
          })
          .catch((error) => {
            console.error("Erro ao buscar produto:", error);
            setProduct(null);
          });
      }
    }
  }, [id, selectedProduct, products, setSelectedProduct]);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0]);
      setSelectedSize(product.sizes?.[0]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      ...product,
      quantity,
      colors: [selectedColor ?? ""],
      sizes: [selectedSize ?? ""],
    });

    navigate("/cart");
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-xl text-black">Produto não encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16 mb-16">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image Section */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl text-black orbitron-bold mb-2">
                {product.name}
              </h1>

              <p className="text-lg text-black opacity-80">
                {product.description}
              </p>
            </div>

            <div className="text-2xl font-bold text-black">
              {formatPrice(product.price ?? 0)}
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 1 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-black">Cor</h3>

                <EnhancedRadioGroup
                  options={product.colors}
                  controlledValue={selectedColor}
                  onChange={(value) => setSelectedColor(value as string)}
                />
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 1 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-black">Tamanho</h3>

                <EnhancedSelector
                  label="Selecione o tamanho"
                  options={product.sizes}
                  onChange={(value) => setSelectedSize(value as string)}
                  controlledValue={selectedSize}
                />
              </div>
            )}

            {/* Quantity Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-black">Quantidade</h3>

              <EnhancedSelector
                label="Selecione a quantidade"
                options={Array.from({ length: 10 }, (_, i) =>
                  (i + 1).toString(),
                )}
                onChange={(value) => setQuantity(Number(value))}
                controlledValue={quantity}
              />
            </div>

            {/* Add to Cart Button */}
            <Button
              variant="add-to-cart"
              onClick={handleAddToCart}
              className="w-full py-4 text-lg font-semibold mt-4 cursor-pointer"
              content="Adicionar ao carrinho"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
