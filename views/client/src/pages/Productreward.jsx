import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPen, FaTrashAlt, FaCheck, FaSearch, FaGift } from "react-icons/fa";

// AddProductRewardModal component
const AddProductRewardModal = ({ isOpen, onClose, onAddProduct }) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    quantity: "",
    points: "",
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleSubmit = async () => {
    if (newProduct.name && newProduct.category && newProduct.points) {
      try {
        const productData = {
          name: newProduct.name,
          category: newProduct.category,
          quantity: Number(newProduct.quantity) || 0,
          description: newProduct.description,
          rewardPoints: Number(newProduct.points),
          type: "reward",
        };

        console.log("Sending data to API:", productData);

        const response = await axios.post(
          "http://localhost:4000/api/rewardproduct/add",
          productData
        );

        // The backend will return the created product with rewardProductId
        const createdProduct = {
          ...response.data,
          isEditing: false
        };
        
        onAddProduct(createdProduct);
        onClose();

        // Reset form
        setNewProduct({
          name: "",
          category: "",
          quantity: "",
          points: "",
          description: "",
        });
      } catch (error) {
        console.error("Error adding reward product:", error);
      }
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-xl font-semibold mb-4">Add New Reward Product</h3>

          <div className="mt-4">
            <label className="block">Product Name</label>
            <input
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 mt-1 text-gray-900"
            />
          </div>
          <div className="mt-4">
            <label className="block">Category</label>
            <input
              type="text"
              name="category"
              value={newProduct.category}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 mt-1 text-gray-900"
            />
          </div>
          <div className="mt-4">
            <label className="block">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={newProduct.quantity}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 mt-1 text-gray-900"
            />
          </div>
          
          <div className="mt-4">
            <label className="block">Points Required</label>
            <input
              type="number"
              name="points"
              value={newProduct.points}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 mt-1 text-gray-900"
            />
          </div>
          
          <div className="mt-4">
            <label className="block">Description</label>
            <textarea
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 mt-1 text-gray-900"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg mr-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Add Reward Product
            </button>
          </div>
        </div>
      </div>
    )
  );
};

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:4000/api/rewardproduct");
        console.log('API Response:', response.data);

        const data = Array.isArray(response.data) 
          ? response.data 
          : response.data.products || [];
        
        const productsWithEditing = data.map((product) => ({
          ...product,
          isEditing: false,
        }));

        setProducts(productsWithEditing);
        setFilteredProducts(productsWithEditing);
        setError(null);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      const searchResults = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(searchResults);
      setCurrentPage(1);
    }
  };

  const handleEditClick = (rewardProductId) => {
    const updated = filteredProducts.map((product) =>
      product.rewardProductId === rewardProductId ? { ...product, isEditing: true } : product
    );
    setFilteredProducts(updated);
    setProducts(
      products.map((p) =>
        p.rewardProductId === rewardProductId ? { ...p, isEditing: true } : p
      )
    );
  };

  const handleDoneClick = async (rewardProductId, newPoints, newQuantity) => {
    try {
      const updateData = {
        rewardPoints: Number(newPoints),
        quantity: Number(newQuantity),
      };

      await axios.put(`http://localhost:4000/api/rewardproduct/${rewardProductId}`, updateData);
      
      const updated = filteredProducts.map((product) =>
        product.rewardProductId === rewardProductId
          ? {
              ...product,
              rewardPoints: newPoints,
              quantity: newQuantity,
              isEditing: false,
            }
          : product
      );
      setFilteredProducts(updated);
      setProducts(updated);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDeleteClick = async (rewardProductId) => {
    try {
      await axios.delete(`http://localhost:4000/api/rewardproduct/${rewardProductId}`);
      const updated = products.filter(
        (product) => product.rewardProductId !== rewardProductId
      );
      setProducts(updated);
      setFilteredProducts(updated);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleAddProduct = (newProduct) => {
    const updated = [...products, { ...newProduct, isEditing: false }];
    setProducts(updated);
    setFilteredProducts(updated);
  };

  const getStockStatus = (quantity) => (quantity < 10 ? "Low" : "Normal");

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 ml-8 flex items-center justify-center">
        <div className="text-xl text-gray-900">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 ml-8 flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ml-8">
      <div className="py-4 px-6 flex justify-between items-center">
        <div className="relative flex gap-2 items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchSubmit}
            placeholder="Search by Name or Category"
            className="border rounded-lg px-3 py-1 w-64 text-gray-900"
          />
          <FaSearch className="absolute right-2 text-gray-400" size={18} />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#4F7A94] text-white px-4 py-2 rounded-lg"
        >
          Add Reward Product
        </button>
      </div>

      <div className="p-6">
        {products.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-900">
            No reward products found. Add some products to get started.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-[#4F7A94] text-white text-left text-lg">
                <tr>
                  <th className="py-4 px-4">Name</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Quantity</th>
                  <th className="py-4 px-4">Points</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product, index) => (
                  <tr
                    key={product.rewardProductId}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-4 px-4 text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-gray-500">
                          {product.rewardProductId}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{product.category}</td>
                    <td className="py-4 px-4 text-gray-900">
                      {product.isEditing ? (
                        <input
                          type="number"
                          defaultValue={product.quantity}
                          onBlur={(e) =>
                            handleDoneClick(
                              product.rewardProductId,
                              product.rewardPoints,
                              e.target.value
                            )
                          }
                          className="border rounded px-2 py-1 w-20 text-gray-900"
                        />
                      ) : (
                        <span>{product.quantity}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      {product.isEditing ? (
                        <input
                          type="number"
                          defaultValue={product.rewardPoints}
                          onBlur={(e) =>
                            handleDoneClick(
                              product.rewardProductId,
                              e.target.value,
                              product.quantity
                            )
                          }
                          className="border rounded px-2 py-1 w-24 text-gray-900"
                        />
                      ) : (
                        <span className="font-semibold">{product.rewardPoints}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          getStockStatus(product.quantity) === "Low"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {getStockStatus(product.quantity)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      <div className="flex gap-2">
                        {product.isEditing ? (
                          <FaCheck
                            className="cursor-pointer"
                            onClick={() =>
                              handleDoneClick(
                                product.rewardProductId,
                                product.rewardPoints,
                                product.quantity
                              )
                            }
                          />
                        ) : (
                          <FaPen
                            className="cursor-pointer"
                            onClick={() => handleEditClick(product.rewardProductId)}
                          />
                        )}
                        <FaTrashAlt
                          className="cursor-pointer text-red-600"
                          onClick={() => handleDeleteClick(product.rewardProductId)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {products.length > 0 && (
        <div className="py-4 px-6 flex justify-between items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="bg-gray-300 px-4 py-2 rounded-lg"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="text-lg text-gray-900">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="bg-gray-300 px-4 py-2 rounded-lg"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <AddProductRewardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
};

export default ProductTable;