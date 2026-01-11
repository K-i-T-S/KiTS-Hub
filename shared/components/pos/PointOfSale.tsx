import React, { useState, useEffect } from 'react';
import { Product, Sale, SaleItem, PaymentMethod } from '../../types';
import { PosService } from '../../services/api/pos-service';
import { InventoryService } from '../../services/api/inventory-service';

export function PointOfSale() {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const posService = new PosService();
  const inventoryService = new InventoryService();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await inventoryService.getProducts(1, 100, {
        status: 'active',
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product_id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total_price: (item.quantity + 1) * item.unit_price - (item.discount_amount || 0)
              }
            : item
        );
      } else {
        const newItem: SaleItem = {
          id: `temp-${Date.now()}`,
          sale_id: '',
          product_id: product.id,
          quantity: 1,
          unit_price: product.unit_price,
          discount_amount: 0,
          total_price: product.unit_price,
          cost_price: product.cost_price,
          profit: product.unit_price - product.cost_price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return [...prevCart, newItem];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item => {
        if (item.product_id === productId) {
          const product = products.find(p => p.id === productId);
          return {
            ...item,
            quantity,
            total_price: quantity * item.unit_price - (item.discount_amount || 0)
          };
        }
        return item;
      })
    );
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateTax = () => {
    // Assuming 10% tax rate - this should be configurable
    return calculateSubtotal() * 0.1;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const processSale = async (paymentMethod: PaymentMethod) => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    setProcessingPayment(true);
    try {
      const saleData = {
        customer_id: selectedCustomer || undefined,
        subtotal: calculateSubtotal(),
        tax_amount: calculateTax(),
        total_amount: calculateTotal(),
        payment_method: paymentMethod,
        status: 'completed' as const,
        items: cart,
      };

      const sale = await posService.createSale(saleData);
      await posService.completeSale(sale.id!, {
        method: paymentMethod,
        amount: calculateTotal(),
      });

      // Clear cart and show success
      setCart([]);
      setSelectedCustomer(null);
      setShowPaymentModal(false);
      alert('Sale completed successfully!');
      
      // Generate receipt (in a real app, this would open a print dialog)
      const receipt = await posService.generateReceipt(sale.id!);
      console.log('Receipt:', receipt);
      
    } catch (error) {
      console.error('Failed to process sale:', error);
      alert('Failed to process sale. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleProductClick = (product: Product) => {
    addToCart(product);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredProducts.length === 1) {
      addToCart(filteredProducts[0]);
      setSearchTerm('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Product Selection */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Point of Sale</h1>
            
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.sku}</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-blue-600">
                        ${product.unit_price.toFixed(2)}
                      </span>
                      <span className={`text-sm ${
                        product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.stock_quantity} in stock
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="w-full mt-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found for "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Cart and Checkout */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Current Sale</h2>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Cart is empty</p>
                <p className="text-sm text-gray-400 mt-2">Add products to start a sale</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => {
                  const product = products.find(p => p.id === item.product_id);
                  return (
                    <div key={item.product_id} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product?.name}</h4>
                        <p className="text-sm text-gray-500">${item.unit_price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${item.total_price.toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 p-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0 || processingPayment}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processingPayment ? 'Processing...' : 'Complete Sale'}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Select Payment Method</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => processSale('cash')}
                disabled={processingPayment}
                className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left flex items-center space-x-3 disabled:opacity-50"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">$</span>
                </div>
                <div>
                  <div className="font-medium">Cash</div>
                  <div className="text-sm text-gray-500">Pay with cash</div>
                </div>
              </button>

              <button
                onClick={() => processSale('card')}
                disabled={processingPayment}
                className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left flex items-center space-x-3 disabled:opacity-50"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">💳</span>
                </div>
                <div>
                  <div className="font-medium">Card</div>
                  <div className="text-sm text-gray-500">Credit/Debit card</div>
                </div>
              </button>

              <button
                onClick={() => processSale('mobile_money')}
                disabled={processingPayment}
                className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left flex items-center space-x-3 disabled:opacity-50"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">📱</span>
                </div>
                <div>
                  <div className="font-medium">Mobile Money</div>
                  <div className="text-sm text-gray-500">Mobile payment</div>
                </div>
              </button>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
