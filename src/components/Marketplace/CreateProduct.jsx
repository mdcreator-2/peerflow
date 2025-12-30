import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';
import { validateProductForm } from '../../utils/validators';
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, HOSTELS } from '../../utils/constants';
import toast from 'react-hot-toast';

const CreateProduct = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    quantity: '1',
    condition: '',
    hostel: userProfile?.location?.hostel || '',
    pickup_available: true,
    delivery_available: false,
    delivery_fee: '0',
  });
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ?  checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e. target.files);
    
    if (files. length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (! file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ... validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateProductForm(formData);
    if (! validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setLoading(true);

    try {
      const productId = await createProduct(
        currentUser. uid,
        userProfile,
        formData,
        images
      );

      toast.success('Product listed successfully!');
      navigate(`/product/${productId}`);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product.  Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm: px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">List a Product</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-gray-500 mt-1">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">Upload up to 5 images.  Max 5MB each.</p>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`mt-1 input-field ${errors.title ?  'input-error' : ''}`}
                placeholder="e.g., Arduino Starter Kit"
              />
              {errors. title && <p className="mt-1 text-sm text-red-600">{errors. title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`mt-1 input-field ${errors.description ? 'input-error' : ''}`}
                placeholder="Describe your product in detail..."
              />
              {errors. description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.category ? 'input-error' : ''}`}
                >
                  <option value="">Select category</option>
                  {PRODUCT_CATEGORIES. map(cat => (
                    <option key={cat.id} value={cat. id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.condition ? 'input-error' : ''}`}
                >
                  <option value="">Select condition</option>
                  {PRODUCT_CONDITIONS. map(cond => (
                    <option key={cond.id} value={cond.id}>{cond.name}</option>
                  ))}
                </select>
                {errors.condition && <p className="mt-1 text-sm text-red-600">{errors. condition}</p>}
              </div>
            </div>

            {/* Price & Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="1"
                  value={formData.price}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors. price ? 'input-error' : ''}`}
                  placeholder="0"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  max="100"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors. quantity ? 'input-error' : ''}`}
                />
                {errors. quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="hostel" className="block text-sm font-medium text-gray-700">
                Location (Hostel)
              </label>
              <select
                id="hostel"
                name="hostel"
                value={formData. hostel}
                onChange={handleChange}
                className="mt-1 input-field"
              >
                <option value="">Select hostel</option>
                {HOSTELS. map(hostel => (
                  <option key={hostel.id} value={hostel.id}>{hostel.name}</option>
                ))}
              </select>
            </div>

            {/* Delivery Options */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Delivery Options</label>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pickup_available"
                  name="pickup_available"
                  checked={formData.pickup_available}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="pickup_available" className="ml-2 text-sm text-gray-700">
                  Pickup on campus available
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="delivery_available"
                  name="delivery_available"
                  checked={formData.delivery_available}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="delivery_available" className="ml-2 text-sm text-gray-700">
                  Delivery available
                </label>
              </div>

              {formData.delivery_available && (
                <div className="ml-6">
                  <label htmlFor="delivery_fee" className="block text-sm font-medium text-gray-700">
                    Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    id="delivery_fee"
                    name="delivery_fee"
                    min="0"
                    value={formData. delivery_fee}
                    onChange={handleChange}
                    className="mt-1 input-field w-32"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  'List Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;