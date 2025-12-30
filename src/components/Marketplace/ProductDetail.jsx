import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById } from '../../services/productService';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { formatPrice, formatDate, formatRelativeTime } from '../../utils/formatters';
import { PRODUCT_CONDITIONS, PRODUCT_CATEGORIES } from '../../utils/constants';
import { PageLoader } from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart, isInCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await getProductById(id);
      if (data) {
        setProduct(data);
      } else {
        toast.error('Product not found');
        navigate('/marketplace');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (isInCart(product.id)) {
      toast.error('Already in cart! ');
      return;
    }

    const mainImage = product.images?.[0]?.url || '';
    
    addToCart({
      id: product.id,
      title: product.title,
      price:  product.price,
      image: mainImage,
      seller_id: product.seller_id,
      seller_name: product.seller_name,
      maxQuantity: product.quantity,
      delivery_fee: product.delivery_options?.delivery_fee || 0,
    }, quantity);

    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!product) {
    return null;
  }

  const condition = PRODUCT_CONDITIONS.find(c => c. id === product.condition);
  const category = PRODUCT_CATEGORIES.find(c => c.id === product.category);
  const images = product.images?. length > 0 
    ? product.images 
    : [{ url: 'https://via.placeholder.com/600x400?text=No+Image' }];
  const isOwner = currentUser?.uid === product.seller_id;
  const isAvailable = product.availability?.is_available;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm: px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/marketplace" className="hover:text-primary-600">Marketplace</Link>
          <span>/</span>
          <Link to={`/marketplace?category=${product.category}`} className="hover:text-primary-600">
            {category?.name || 'Products'}
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-[200px]">{product.title}</span>
        </nav>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={images[selectedImage]?.url}
                  alt={product.title}
                  className="w-full h-80 object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ?  'border-primary-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {product. title}
                  </h1>
                  {! isAvailable && (
                    <span className="badge badge-danger">SOLD</span>
                  )}
                </div>
                <div className="mt-2 flex items-center space-x-3">
                  {condition && (
                    <span className="badge badge-primary">{condition.name}</span>
                  )}
                  {category && (
                    <span className="badge bg-gray-100 text-gray-700">
                      {category.icon} {category.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-3xl font-bold text-primary-600">
                {formatPrice(product. price)}
              </div>

              <div className="prose prose-sm max-w-none text-gray-600">
                <p>{product.description}</p>
              </div>

              {/* Product Info */}
              <div className="border-t border-b border-gray-100 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quantity Available</span>
                  <span className="font-medium">{product.quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium">{product.location?. hostel || 'Campus'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pickup</span>
                  <span className="font-medium">
                    {product.delivery_options?. pickup_on_campus ? '✓ Available' : '✗ Not available'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="font-medium">
                    {product.delivery_options?. delivery_available 
                      ? `✓ Available (+${formatPrice(product.delivery_options.delivery_fee)})` 
                      : '✗ Not available'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Listed</span>
                  <span className="font-medium">{formatRelativeTime(product.availability?.created_at)}</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Seller</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {product.seller_avatar ?  (
                      <img
                        src={product.seller_avatar}
                        alt={product.seller_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium">
                        {product.seller_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{product.seller_name}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1">{product.seller_rating?. toFixed(1) || 'New'}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/user/${product.seller_id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Profile
                  </Link>
                </div>
              </div>

              {/* Actions */}
              {isAvailable && ! isOwner && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-700">Quantity: </label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={isInCart(product. id)}
                      className="flex-1 btn-secondary"
                    >
                      {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 btn-primary"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              )}

              {isOwner && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    This is your product. {' '}
                    <Link to={`/edit-product/${product.id}`} className="font-medium underline">
                      Edit listing
                    </Link>
                  </p>
                </div>
              )}

              {! isAvailable && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    This product has been sold and is no longer available. 
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;